from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False)
    email_provider = Column(String(50), default="gmail")
    access_token = Column(Text, nullable=False)  # encrypted at rest
    refresh_token = Column(Text, nullable=False)  # encrypted at rest
    created_at = Column(DateTime, default=datetime.utcnow)
    last_scan_at = Column(DateTime)

    subscriptions = relationship("Subscription", back_populates="user", cascade="all, delete-orphan")
    unsubscribe_actions = relationship("UnsubscribeAction", back_populates="user", cascade="all, delete-orphan")

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    sender_email = Column(String(255), nullable=False)
    sender_name = Column(String(255))
    unsubscribe_link = Column(Text)
    unsubscribe_method = Column(String(50))  # 'link', 'mailto', or 'list-unsubscribe'
    status = Column(String(50), default="active")  # 'active', 'unsubscribed', 'failed'
    email_count = Column(Integer, default=1)
    first_detected_at = Column(DateTime, default=datetime.utcnow)
    last_email_received_at = Column(DateTime)

    user = relationship("User", back_populates="subscriptions")
    actions = relationship("UnsubscribeAction", back_populates="subscription", cascade="all, delete-orphan")

    __table_args__ = (UniqueConstraint('user_id', 'sender_email', name='_user_sender_uc'),)

class UnsubscribeAction(Base):
    __tablename__ = "unsubscribe_actions"

    id = Column(Integer, primary_key=True, index=True)
    subscription_id = Column(Integer, ForeignKey("subscriptions.id", ondelete="CASCADE"))
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    action_type = Column(String(50))  # 'unsubscribe_requested', 'verified_stopped', 'still_sending'
    attempted_at = Column(DateTime, default=datetime.utcnow)
    method_used = Column(String(50))  # 'link_click', 'mailto', 'list-unsubscribe-header'
    success = Column(Boolean)
    error_message = Column(Text)

    subscription = relationship("Subscription", back_populates="actions")
    user = relationship("User", back_populates="unsubscribe_actions")
