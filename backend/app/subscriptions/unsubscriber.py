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
        if subscription.unsubscribe_method == 'list-unsubscribe' or subscription.unsubscribe_method == 'link':
            # Handle HTTP GET
            async with httpx.AsyncClient(follow_redirects=True, timeout=10.0) as client:
                response = await client.get(subscription.unsubscribe_link)
                if response.status_code < 400:
                    # Basic success check
                    if '<form' in response.text.lower():
                        # Requires manual action
                        success = False
                        error_message = "Requires manual form submission"
                    else:
                        success = True
                else:
                    success = False
                    error_message = f"HTTP Error: {response.status_code}"
                    
        elif subscription.unsubscribe_method == 'mailto':
            # Handle mailto via Gmail API
            service = get_gmail_service(user)
            # mailto:unsub@example.com?subject=unsubscribe
            target = subscription.unsubscribe_link.replace('mailto:', '')
            email_address = target.split('?')[0]
            subject = "unsubscribe"
            if 'subject=' in target:
                subject = target.split('subject=')[1].split('&')[0]
                
            message = EmailMessage()
            message.set_content("Unsubscribe request from Unclutter.")
            message['To'] = email_address
            message['Subject'] = subject
            
            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
            service.users().messages().send(userId='me', body={'raw': raw_message}).execute()
            success = True
            
    except Exception as e:
        success = False
        error_message = str(e)
    
    # Update subscription status
    subscription.status = 'unsubscribed' if success else 'failed'
    
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
            if result['status'] == 'unsubscribed':
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
