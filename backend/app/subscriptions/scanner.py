from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from sqlalchemy.orm import Session
from ..models import Subscription, User
from ..utils.encryption import decrypt_token
import base64
import re
from datetime import datetime
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
            msg = service.users().messages().get(userId='me', id=msg_ref['id'], format='full').execute()
            headers = msg.get('payload', {}).get('headers', [])
            
            sender_info = next((h['value'] for h in headers if h['name'].lower() == 'from'), None)
            list_unsub = next((h['value'] for h in headers if h['name'].lower() == 'list-unsubscribe'), None)
            date_str = next((h['value'] for h in headers if h['name'].lower() == 'date'), None)
            
            if not sender_info:
                continue
                
            # Parse sender
            match = re.match(r'(?:"?([^"]*)"?\s)?(?:<(.+)>|(.+))', sender_info)
            if match:
                sender_name = match.group(1) or ""
                sender_email = match.group(2) or match.group(3)
            else:
                sender_name = ""
                sender_email = sender_info
                
            # Check whitelist
            domain = sender_email.split('@')[-1] if '@' in sender_email else ""
            if domain.lower() in IMPORTANT_SENDER_DOMAINS:
                continue
            
            method, link = None, None
            if list_unsub:
                method, link = parse_list_unsubscribe(list_unsub)
            
            if not link:
                # Fallback to body scan
                parts = msg.get('payload', {}).get('parts', [])
                body = ""
                for part in parts:
                    if part['mimeType'] == 'text/plain':
                        body = base64.urlsafe_b64decode(part['body'].get('data', '')).decode('utf-8', errors='ignore')
                        break
                    elif part['mimeType'] == 'text/html':
                        body = base64.urlsafe_b64decode(part['body'].get('data', '')).decode('utf-8', errors='ignore')
                
                if body:
                    link = find_unsub_link_in_body(body)
                    if link:
                        method = 'link'
            
            if link:
                # Update map for batch upsert
                if sender_email not in subscriptions_map:
                    subscriptions_map[sender_email] = {
                        "name": sender_name,
                        "link": link,
                        "method": method,
                        "count": 1,
                        "last_received": date_str
                    }
                else:
                    subscriptions_map[sender_email]["count"] += 1
        
        # Rate limit protection
        time.sleep(0.5)

    # Upsert into database
    for email, data in subscriptions_map.items():
        existing = db.query(Subscription).filter(Subscription.user_id == user.id, Subscription.sender_email == email).first()
        if existing:
            existing.email_count += data['count']
            # Update date if newer (naive implementation)
            existing.last_email_received_at = datetime.utcnow() # Simplified
        else:
            new_sub = Subscription(
                user_id=user.id,
                sender_email=email,
                sender_name=data['name'],
                unsubscribe_link=data['link'],
                unsubscribe_method=data['method'],
                email_count=data['count'],
                last_email_received_at=datetime.utcnow()
            )
            db.add(new_sub)
            new_found += 1
            
    user.last_scan_at = datetime.utcnow()
    db.commit()
    
    return {
        "new_subscriptions_found": new_found,
        "scan_completed_at": datetime.utcnow().isoformat(),
        "total_scanned": total_scanned
    }
