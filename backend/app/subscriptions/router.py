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
    query = db.query(Subscription).filter(Subscription.user_id == current_user.id)
    if status:
        query = query.filter(Subscription.status == status)
    
    total = query.count()
    subscriptions = query.offset(offset).limit(limit).all()
    
    return {
        "subscriptions": subscriptions,
        "total": total
    }

@router.post("/scan")
def trigger_scan(
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
