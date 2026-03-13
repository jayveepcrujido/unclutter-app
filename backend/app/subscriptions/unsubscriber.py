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
from bs4 import BeautifulSoup  # type: ignore[import]
from urllib.parse import urljoin
import re
from typing import Dict, Tuple, Optional, cast
from .scanner import parse_list_unsubscribe, find_unsub_link_in_body

CONFIRM_KEYWORDS = re.compile(r"(confirm|unsubscribe|yes|continue|submit)", re.IGNORECASE)
TEXT_INPUT_TYPES = {"text", "email", "password", "search", "tel", "number", "url"}

MANUAL_MESSAGE = "Manual confirmation required"


def _extract_body_content(payload: Dict) -> str:
    if not payload:
        return ""

    body_data = payload.get('body', {}).get('data')
    mime_type = (payload.get('mimeType') or '').lower()

    if body_data and mime_type in {'text/html', 'text/plain', ''}:
        try:
            return base64.urlsafe_b64decode(body_data).decode('utf-8', errors='ignore')
        except Exception:
            return ""

    for part in payload.get('parts', []) or []:
        part_mime = (part.get('mimeType') or '').lower()
        data = part.get('body', {}).get('data')
        if data and part_mime == 'text/html':
            try:
                return base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')
            except Exception:
                continue

    for part in payload.get('parts', []) or []:
        nested = _extract_body_content(part)
        if nested:
            return nested

    return ""


def _get_latest_unsubscribe_target(service, sender_email: str) -> Tuple[Optional[str], Optional[str]]:
    if not sender_email:
        return None, None

    try:
        query = f'from:{sender_email}'
        message_refs = service.users().messages().list(userId='me', q=query, maxResults=1).execute().get('messages', [])
    except Exception:
        return None, None

    if not message_refs:
        return None, None

    try:
        message = service.users().messages().get(userId='me', id=message_refs[0]['id'], format='full').execute()
    except Exception:
        return None, None

    payload = message.get('payload', {})
    headers = payload.get('headers', [])
    list_unsub = next((h['value'] for h in headers if h['name'].lower() == 'list-unsubscribe'), None)
    list_unsub_post = next((h['value'] for h in headers if h['name'].lower() == 'list-unsubscribe-post'), None)

    method, link = parse_list_unsubscribe(list_unsub) if list_unsub else (None, None)

    if list_unsub_post and link and 'one-click' in list_unsub_post.lower():
        method = 'list-unsubscribe-post'

    if not link:
        body_html = _extract_body_content(payload)
        if body_html:
            link = find_unsub_link_in_body(body_html)
            if link and not method:
                method = 'link'

    return method, link


def get_gmail_service(user: User):
    token = cast(str, user.access_token)
    creds = Credentials(decrypt_token(token))
    return build('gmail', 'v1', credentials=creds)


def _form_has_confirmation_hint(form) -> bool:
    action = form.get('action') or ''
    if CONFIRM_KEYWORDS.search(action):
        return True
    for text_value in form.stripped_strings:
        if CONFIRM_KEYWORDS.search(text_value):
            return True
    for input_tag in form.find_all('input'):
        value = input_tag.get('value')
        if value and CONFIRM_KEYWORDS.search(value):
            return True
    return False


def _build_form_submission(form, base_url: str) -> Tuple[Dict[str, str] | None, bool]:
    payload: Dict[str, str] = {}
    requires_manual = False

    for field in form.find_all(['input', 'textarea', 'select']):
        name = field.get('name')
        if not name:
            continue

        if field.name == 'textarea':
            value = (field.text or '').strip()
            if not value:
                requires_manual = True
                break
            payload[name] = value
            continue

        if field.name == 'select':
            option = field.find('option', selected=True) or field.find('option')
            if option and option.get('value') is not None:
                payload[name] = option.get('value')
            else:
                requires_manual = True
            continue

        field_type = field.get('type', 'text').lower()
        if field_type in TEXT_INPUT_TYPES:
            value = (field.get('value') or '').strip()
            if not value:
                requires_manual = True
                break
            payload[name] = value
        elif field_type in ['hidden']:
            payload[name] = field.get('value', '')
        elif field_type in ['checkbox', 'radio']:
            if field.has_attr('checked'):
                payload[name] = field.get('value', 'on')
        elif field_type in ['submit', 'button']:
            continue
        else:
            continue

    if requires_manual:
        return None, True

    return payload, False


def _extract_confirmation_forms(soup: BeautifulSoup, base_url: str):
    forms_to_submit = []
    manual_only_detected = False

    for form in soup.find_all('form'):
        if not _form_has_confirmation_hint(form):
            continue
        payload, requires_manual = _build_form_submission(form, base_url)
        if requires_manual:
            manual_only_detected = True
            continue
        action = form.get('action') or base_url
        method = (form.get('method') or 'GET').upper()
        forms_to_submit.append({
            'url': urljoin(base_url, action),
            'method': method,
            'payload': payload or {}
        })

    return forms_to_submit, manual_only_detected


def _extract_confirmation_links(soup: BeautifulSoup, base_url: str):
    links = []
    seen = set()
    for anchor in soup.find_all(['a', 'button']):
        if anchor.name == 'a':
            href = anchor.get('href')
        else:
            href = anchor.get('data-href') or anchor.get('formaction')
        if not href:
            continue
        text = ' '.join(anchor.stripped_strings)
        if text and CONFIRM_KEYWORDS.search(text):
            url = urljoin(base_url, href)
            if url not in seen:
                seen.add(url)
                links.append(url)
    return links


async def _handle_unsubscribe_page(client: httpx.AsyncClient, html: str, base_url: str) -> Tuple[str, Optional[str]]:
    if not html:
        return "confirmed", None

    soup = BeautifulSoup(html, 'html.parser')
    text_content = soup.get_text(" ", strip=True).lower()
    if 'captcha' in text_content or 'recaptcha' in text_content or soup.find(attrs={'data-sitekey': True}):
        return "manual", "Page requires human verification"

    confirm_links = _extract_confirmation_links(soup, base_url)
    confirm_forms, manual_forms_detected = _extract_confirmation_forms(soup, base_url)

    attempted = False

    for link in confirm_links:
        attempted = True
        try:
            resp = await client.get(link)
            if resp.status_code < 400:
                return "confirmed", None
        except Exception:
            continue

    for form in confirm_forms:
        attempted = True
        try:
            if form['method'] == 'POST':
                resp = await client.post(form['url'], data=form['payload'])
            else:
                resp = await client.get(form['url'], params=form['payload'])
            if resp.status_code < 400:
                return "confirmed", None
        except Exception:
            continue

    if manual_forms_detected or attempted:
        return "manual", "Manual confirmation required"

    return "confirmed", None

async def process_unsubscribe(db: Session, user: User, subscription: Subscription):
    success = False
    manual_required = False
    manual_reason: Optional[str] = None
    error_message: Optional[str] = None
    method_attr = cast(Optional[str], subscription.unsubscribe_method)
    method_value = method_attr or ''
    method_used = method_value
    attempt_time = datetime.utcnow()
    service = None

    try:
        link_attr = cast(Optional[str], subscription.unsubscribe_link)
        link_url = link_attr or ""

        try:
            service = get_gmail_service(user)
        except Exception:
            service = None

        if service:
            refreshed_method, refreshed_link = _get_latest_unsubscribe_target(service, cast(str, subscription.sender_email))
            if refreshed_link:
                method_value = refreshed_method or method_value or 'link'
                method_used = method_value
                setattr(subscription, 'unsubscribe_link', refreshed_link)
                setattr(subscription, 'unsubscribe_method', method_value)
                link_url = refreshed_link

        common_headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
        }

        if method_value in ['list-unsubscribe', 'link']:
            if not link_url:
                error_message = "Missing unsubscribe URL"
            else:
                async with httpx.AsyncClient(follow_redirects=True, timeout=15.0, headers=common_headers, verify=False) as client:
                    response = await client.get(link_url)
                    if response.status_code < 400:
                        confirm_state, manual_reason = await _handle_unsubscribe_page(client, response.text, link_url)
                        if confirm_state == "confirmed":
                            success = True
                        else:
                            manual_required = True
                            error_message = manual_reason or MANUAL_MESSAGE
                    else:
                        error_message = f"HTTP Error: {response.status_code}"

        elif method_value == 'list-unsubscribe-post':
            if not link_url:
                error_message = "Missing unsubscribe endpoint"
            else:
                async with httpx.AsyncClient(follow_redirects=True, timeout=15.0, headers=common_headers, verify=False) as client:
                    headers = {
                        **common_headers,
                        "List-Unsubscribe": "One-Click",
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                    response = await client.post(
                        link_url,
                        data={"List-Unsubscribe": "One-Click"},
                        headers=headers
                    )
                    if response.status_code < 400:
                        confirm_state, manual_reason = await _handle_unsubscribe_page(client, response.text, link_url)
                        if confirm_state == "confirmed":
                            success = True
                        else:
                            manual_required = True
                            error_message = manual_reason or MANUAL_MESSAGE
                    else:
                        error_message = f"HTTP Error: {response.status_code}"

        elif method_value == 'mailto':
            if not link_url:
                error_message = "Missing mailto address"
            else:
                if service is None:
                    service = get_gmail_service(user)
                target = link_url.replace('mailto:', '')

                email_address = target
                subject = "unsubscribe"
                body_content = "Unsubscribe request from Unclutter."

                if '?' in target:
                    email_address = target.split('?')[0]
                    query_params = target.split('?')[1].split('&')
                    for param in query_params:
                        if '=' in param:
                            key, val = param.split('=', 1)
                            from urllib.parse import unquote
                            if key.lower() == 'subject':
                                subject = unquote(val)
                            elif key.lower() == 'body':
                                body_content = unquote(val)

                message = EmailMessage()
                message.set_content(body_content)
                message['To'] = email_address
                message['Subject'] = subject

                raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
                service.users().messages().send(userId='me', body={'raw': raw_message}).execute()
                success = True

        else:
            error_message = "Unsupported unsubscribe method"

    except Exception as e:
        error_message = str(e)

    setattr(subscription, 'last_unsubscribe_attempt_at', attempt_time)

    if manual_required:
        setattr(subscription, 'status', 'manual_required')
        if not error_message:
            error_message = MANUAL_MESSAGE
    elif success:
        setattr(subscription, 'status', 'unsubscribed')
    else:
        setattr(subscription, 'status', 'failed')
        if not error_message:
            error_message = "Unsubscribe attempt failed"

    action = UnsubscribeAction(
        subscription_id=subscription.id,
        user_id=user.id,
        action_type='unsubscribe_requested',
        method_used=method_used,
        success=success and not manual_required,
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
    manual_count = 0
    
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
            elif result['status'] == 'manual_required':
                manual_count += 1
            else:
                failed_count += 1
            
            # Delay to avoid bot detection
            time.sleep(0.5)
            
    return {
        "success_count": success_count,
        "failed_count": failed_count,
        "manual_count": manual_count,
        "results": results
    }
