from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from sqlalchemy.orm import Session
from ..models import Subscription, User
from ..utils.encryption import decrypt_token
import base64
import re
from datetime import datetime, timezone
import time

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
