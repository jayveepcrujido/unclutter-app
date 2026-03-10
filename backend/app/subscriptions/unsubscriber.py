import httpx
from sqlalchemy.orm import Session
from ..models import Subscription, UnsubscribeAction, User
from ..utils.encryption import decrypt_token
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import time
from datetime import datetime
import base64
from email.message import EmailMessage

def get_gmail_service(user: User):
    creds = Credentials(decrypt_token(user.access_token))
    return build('gmail', 'v1', credentials=creds)

async def process_unsubscribe(db: Session, user: User, subscription: Subscription):
    success = False
    error_message = None
    method_used = subscription.unsubscribe_method
    
    try:
        common_headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
        }
        
        if subscription.unsubscribe_method == 'list-unsubscribe' or subscription.unsubscribe_method == 'link':
            # Handle HTTP GET
            # Disable SSL verification to handle cases like LinkedIn's certificate error
            async with httpx.AsyncClient(follow_redirects=True, timeout=15.0, headers=common_headers, verify=False) as client:
                response = await client.get(subscription.unsubscribe_link)
                if response.status_code < 400:
                    # Basic success check
                    if '<form' in response.text.lower() and not any(k in response.text.lower() for k in ['unsubscribed', 'success', 'removed']):
                        # Requires manual action
                        success = False
                        error_message = "Requires manual form submission"
                    else:
                        success = True
                else:
                    success = False
                    error_message = f"HTTP Error: {response.status_code}"

        elif subscription.unsubscribe_method == 'list-unsubscribe-post':
            # Use headers for post as well
            async with httpx.AsyncClient(follow_redirects=True, timeout=15.0, headers=common_headers, verify=False) as client:
                headers = {
                    **common_headers,
                    "List-Unsubscribe": "One-Click",
                    "Content-Type": "application/x-www-form-urlencoded"
                }
                response = await client.post(
                    subscription.unsubscribe_link,
                    data="List-Unsubscribe=One-Click",
                    headers=headers
                )
                if response.status_code < 400:
                    success = True
                else:
                    success = False
                    error_message = f"HTTP Error: {response.status_code}"

        elif subscription.unsubscribe_method == 'mailto':
            # Handle mailto via Gmail API
            service = get_gmail_service(user)
            # mailto:unsub@example.com?subject=unsubscribe&body=remove
            target = subscription.unsubscribe_link.replace('mailto:', '')
            
            email_address = target
            subject = "unsubscribe"
            body_content = "Unsubscribe request from Unclutter."
            
            if '?' in target:
                email_address = target.split('?')[0]
                query_params = target.split('?')[1].split('&')
                for param in query_params:
                    if '=' in param:
                        key, val = param.split('=', 1)
                        if key.lower() == 'subject':
                            from urllib.parse import unquote
                            subject = unquote(val)
                        elif key.lower() == 'body':
                            from urllib.parse import unquote
                            body_content = unquote(val)
                
            message = EmailMessage()
            message.set_content(body_content)
            message['To'] = email_address
            message['Subject'] = subject
            
            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
            service.users().messages().send(userId='me', body={'raw': raw_message}).execute()
            success = True
            
    except Exception as e:
        success = False
        error_message = str(e)
    
    # Update subscription status
    if success:
        subscription.status = 'pending_confirmation'
        subscription.last_unsubscribe_attempt_at = datetime.utcnow()
    else:
        subscription.status = 'failed'
    
    # Record action
    action = UnsubscribeAction(
        subscription_id=subscription.id,
        user_id=user.id,
        action_type='unsubscribe_requested',
        method_used=method_used,
        success=success,
        error_message=error_message
    )
    db.add(action)
    db.commit()
    
    return {
        "subscription_id": subscription.id,
        "status": subscription.status,
        "error_message": error_message
    }

async def bulk_unsubscribe_process(db: Session, user: User, subscription_ids: list[int]):
    results = []
    success_count = 0
    failed_count = 0
    
    for sub_id in subscription_ids:
        subscription = db.query(Subscription).filter(
            Subscription.id == sub_id, 
            Subscription.user_id == user.id
        ).first()
        
        if subscription:
            result = await process_unsubscribe(db, user, subscription)
            results.append(result)
            if result['status'] == 'unsubscribed' or result['status'] == 'pending_confirmation':
                success_count += 1
            else:
                failed_count += 1
            
            # Delay to avoid bot detection
            time.sleep(0.5)
            
    return {
        "success_count": success_count,
        "failed_count": failed_count,
        "results": results
    }
