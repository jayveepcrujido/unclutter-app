from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Subscription, User, UnsubscribeAction
from ..auth.router import get_current_user
from .scanner import scan_user_inbox
from .unsubscriber import bulk_unsubscribe_process
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class UnsubscribeRequest(BaseModel):
    subscription_ids: List[int]

@router.get("/")
def get_subscriptions(
    status: Optional[str] = None, 
    limit: int = 50, 
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from sqlalchemy import func
    
    # Subquery to get the latest action for each subscription
    latest_action_subquery = db.query(
        UnsubscribeAction.subscription_id,
        func.max(UnsubscribeAction.attempted_at).label('max_attempted_at')
    ).filter(UnsubscribeAction.user_id == current_user.id).group_by(UnsubscribeAction.subscription_id).subquery()

    query = db.query(Subscription).filter(Subscription.user_id == current_user.id)
    if status:
        query = query.filter(Subscription.status == status)
    
    total = query.count()
    
    # Join with latest action to get error message
    subscriptions_with_actions = db.query(Subscription, UnsubscribeAction.error_message).outerjoin(
        latest_action_subquery, Subscription.id == latest_action_subquery.c.subscription_id
    ).outerjoin(
        UnsubscribeAction, 
        (UnsubscribeAction.subscription_id == latest_action_subquery.c.subscription_id) & 
        (UnsubscribeAction.attempted_at == latest_action_subquery.c.max_attempted_at)
    ).filter(Subscription.user_id == current_user.id)
    
    if status:
        subscriptions_with_actions = subscriptions_with_actions.filter(Subscription.status == status)
        
    results = subscriptions_with_actions.order_by(Subscription.last_email_received_at.desc()).offset(offset).limit(limit).all()
    
    formatted_subscriptions = []
    for sub, error_msg in results:
        sub_dict = {
            "id": sub.id,
            "sender_email": sub.sender_email,
            "sender_name": sub.sender_name,
            "unsubscribe_link": sub.unsubscribe_link,
            "unsubscribe_method": sub.unsubscribe_method,
            "status": sub.status,
            "email_count": sub.email_count,
            "last_email_received_at": sub.last_email_received_at,
            "error_message": error_msg
        }
        formatted_subscriptions.append(sub_dict)
    
    return {
        "subscriptions": formatted_subscriptions,
        "total": total
    }

@router.post("/scan")
async def trigger_scan(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return scan_user_inbox(db, current_user)

@router.post("/unsubscribe")
async def bulk_unsubscribe(
    request: UnsubscribeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await bulk_unsubscribe_process(db, current_user, request.subscription_ids)

@router.get("/{subscription_id}/actions")
def get_actions(
    subscription_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    actions = db.query(UnsubscribeAction).filter(
        UnsubscribeAction.subscription_id == subscription_id,
        UnsubscribeAction.user_id == current_user.id
    ).all()
    return {"actions": actions}
