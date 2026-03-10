from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from sqlalchemy.orm import Session
from ..models import Subscription, User
from ..utils.encryption import decrypt_token
import base64
import re
from datetime import datetime, timezone
import time
import httpx

COMMON_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
}

IMPORTANT_SENDER_DOMAINS = [
  "google.com", "apple.com", "paypal.com", "stripe.com",
  "amazon.com", "chase.com", "bankofamerica.com", "wellsfargo.com",
  "citi.com", "americanexpress.com", "irs.gov", "github.com",
  "linkedin.com", "notion.so", "slack.com", "zoom.us"
]

def get_gmail_service(user: User):
    creds = Credentials(decrypt_token(user.access_token))
    return build('gmail', 'v1', credentials=creds)

def parse_list_unsubscribe(header_value: str):
    # Extract URLs and mailtos from List-Unsubscribe header
    # Example: <https://example.com/unsub>, <mailto:unsub@example.com?subject=unsubscribe>
    urls = re.findall(r'<(https?://[^>]+)>', header_value)
    mailtos = re.findall(r'<(mailto:[^>]+)>', header_value)
    
    if urls:
        return 'list-unsubscribe', urls[0]
    elif mailtos:
        return 'mailto', mailtos[0]
    return None, None

def find_unsub_link_in_body(body: str):
    # Regex to find links with "unsubscribe", "opt-out", or "email-preferences"
    pattern = r'href=["\'](https?://[^"\']*(?:unsubscribe|opt-out|email-preferences|preferences)[^"\']*)["\']'
    match = re.search(pattern, body, re.IGNORECASE)
    if match:
        return match.group(1)
    return None

async def check_for_confirmations(db: Session, user: User):
    service = get_gmail_service(user)
    
    # Find subscriptions pending confirmation
    pending = db.query(Subscription).filter(
        Subscription.user_id == user.id,
        Subscription.status == 'pending_confirmation'
    ).all()
    
    confirm_count = 0
    
    for sub in pending:
        # Search for recent emails from this sender after the attempt
        query = f'from:{sub.sender_email} (confirm OR verify OR unsubscribe OR "action required")'
        results = service.users().messages().list(userId='me', q=query, maxResults=5).execute()
        messages = results.get('messages', [])
        
        found_confirm_link = False
        
        for msg_ref in messages:
            msg = service.users().messages().get(userId='me', id=msg_ref['id'], format='full').execute()
            
            # Check internal date (milliseconds since epoch)
            internal_date = int(msg.get('internalDate', 0)) / 1000
            if sub.last_unsubscribe_attempt_at and internal_date < sub.last_unsubscribe_attempt_at.timestamp():
                continue # Old email
                
            # Parse body for links
            parts = msg.get('payload', {}).get('parts', [])
            body = ""
            
            def get_body_recursive(p_parts):
                for p in p_parts:
                    if p['mimeType'] == 'text/html':
                        return base64.urlsafe_b64decode(p['body'].get('data', '')).decode('utf-8', errors='ignore')
                    if 'parts' in p:
                        res = get_body_recursive(p['parts'])
                        if res: return res
                return None
            
            body = get_body_recursive(parts)
            if not body and msg.get('payload', {}).get('body', {}).get('data'):
                body = base64.urlsafe_b64decode(msg['payload']['body']['data']).decode('utf-8', errors='ignore')

            if body:
                confirm_patterns = [
                    r'href=["\'](https?://[^"\']*(?:confirm|verify|yes|success|unsubscribe)[^"\']*)["\']',
                    r'https?://[^\s<>"]*(?:confirm|verify|yes|success|unsubscribe)[^\s<>"]*'
                ]
                
                links = []
                for pattern in confirm_patterns:
                    links.extend(re.findall(pattern, body, re.IGNORECASE))
                
                links.sort(key=lambda x: 'confirm' in x.lower(), reverse=True)
                
                for link in links:
                    try:
                        async with httpx.AsyncClient(follow_redirects=True, timeout=15.0, headers=COMMON_HEADERS, verify=False) as client:
                            resp = await client.get(link)
                            if resp.status_code < 400:
                                found_confirm_link = True
                                break
                    except Exception:
                        continue
                
            if found_confirm_link:
                break
        
        if found_confirm_link:
            sub.status = 'unsubscribed'
            confirm_count += 1
        else:
            if sub.last_unsubscribe_attempt_at and (datetime.now(timezone.utc).replace(tzinfo=None) - sub.last_unsubscribe_attempt_at).days >= 2:
                sub.status = 'unsubscribed' # Optimistic
                
    db.commit()
    return confirm_count

def scan_user_inbox(db: Session, user: User):
    service = get_gmail_service(user)
    
    # Search query
    query = 'in:inbox (unsubscribe OR "email preferences" OR "manage preferences" OR "opt out")'
    results = service.users().messages().list(userId='me', q=query, maxResults=500).execute()
    messages = results.get('messages', [])
    
    new_found = 0
    total_scanned = len(messages)
    
    subscriptions_map = {}
    
    for i in range(0, len(messages), 50):
        batch = messages[i:i+50]
        for msg_ref in batch:
            msg = service.users().messages().get(userId='me', id=msg_ref['id'], format='metadata', metadataHeaders=['From', 'List-Unsubscribe', 'List-Unsubscribe-Post']).execute()
            headers = msg.get('payload', {}).get('headers', [])
            
            internal_date_ms = int(msg.get('internalDate', 0))
            msg_date = datetime.fromtimestamp(internal_date_ms / 1000.0, tz=timezone.utc).replace(tzinfo=None)
            
            sender_info = next((h['value'] for h in headers if h['name'].lower() == 'from'), None)
            list_unsub = next((h['value'] for h in headers if h['name'].lower() == 'list-unsubscribe'), None)
            list_unsub_post = next((h['value'] for h in headers if h['name'].lower() == 'list-unsubscribe-post'), None)
            
            if not sender_info:
                continue
                
            match = re.match(r'(?:"?([^"]*)"?\s)?(?:<(.+)>|(.+))', sender_info)
            if match:
                sender_name = match.group(1) or ""
                sender_email = match.group(2) or match.group(3)
            else:
                sender_name = ""
                sender_email = sender_info
            
            sender_email = sender_email.strip().lower()
            if domain.lower() in IMPORTANT_SENDER_DOMAINS if (domain := sender_email.split('@')[-1] if '@' in sender_email else "") else False:
                continue
            
            if sender_email in subscriptions_map:
                if msg_date > subscriptions_map[sender_email]["last_received_dt"]:
                    subscriptions_map[sender_email]["last_received_dt"] = msg_date
                continue

            method, link = None, None
            if list_unsub:
                method, link = parse_list_unsubscribe(list_unsub)
                if (list_unsub_post and 'one-click' in list_unsub_post.lower() and link and link.startswith('http')):
                    method = 'list-unsubscribe-post'
            
            if not link:
                msg_full = service.users().messages().get(userId='me', id=msg_ref['id'], format='full').execute()
                parts = msg_full.get('payload', {}).get('parts', [])
                
                def get_body(p_parts):
                    for p in p_parts:
                        if p['mimeType'] in ['text/plain', 'text/html']:
                            return base64.urlsafe_b64decode(p['body'].get('data', '')).decode('utf-8', errors='ignore')
                        if 'parts' in p:
                            res = get_body(p['parts'])
                            if res: return res
                    return ""
                
                body = get_body(parts)
                if not body and msg_full.get('payload', {}).get('body', {}).get('data'):
                    body = base64.urlsafe_b64decode(msg_full['payload']['body']['data']).decode('utf-8', errors='ignore')
                
                if body:
                    link = find_unsub_link_in_body(body)
                    if link:
                        method = 'link'
            
            if link:
                subscriptions_map[sender_email] = {
                    "name": sender_name,
                    "link": link,
                    "method": method,
                    "last_received_dt": msg_date
                }
        
        time.sleep(0.5)

    for email, data in subscriptions_map.items():
        existing = db.query(Subscription).filter(Subscription.user_id == user.id, Subscription.sender_email == email).first()
        
        try:
            count_results = service.users().messages().list(userId='me', q=f'from:{email}').execute()
            actual_count = count_results.get('resultSizeEstimate', 1)
        except:
            actual_count = 1

        if existing:
            existing.last_email_received_at = data['last_received_dt']
            existing.email_count = actual_count
            if not existing.sender_name and data['name']:
                existing.sender_name = data['name']
        else:
            new_sub = Subscription(
                user_id=user.id,
                sender_email=email,
                sender_name=data['name'],
                unsubscribe_link=data['link'],
                unsubscribe_method=data['method'],
                email_count=actual_count,
                last_email_received_at=data['last_received_dt']
            )
            db.add(new_sub)
            new_found += 1
            
    user.last_scan_at = datetime.now(timezone.utc).replace(tzinfo=None)
    db.commit()
    
    return {
        "new_subscriptions_found": new_found,
        "scan_completed_at": datetime.now(timezone.utc).isoformat(),
        "total_scanned": total_scanned
    }
