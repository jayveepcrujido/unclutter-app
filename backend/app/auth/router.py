from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from .oauth import get_auth_url, get_tokens_from_code
from ..utils.encryption import encrypt_token, decrypt_token
from pydantic import BaseModel
from jose import jwt
from datetime import datetime, timedelta
import os
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials

router = APIRouter()

SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 days

class ConnectEmailRequest(BaseModel):
    provider: str
    redirect_uri: str

class CallbackRequest(BaseModel):
    code: str
    state: str

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

def get_current_user(auth: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = auth.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except Exception:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/connect-email")
def connect_email(request: ConnectEmailRequest):
    auth_url, state = get_auth_url()
    return {"auth_url": auth_url, "state": state}

@router.post("/callback")
def auth_callback(request: CallbackRequest, db: Session = Depends(get_db)):
    try:
        token_data = get_tokens_from_code(request.code)
        
        # Get user info from Google
        creds = Credentials(token_data['access_token'])
        service = build('oauth2', 'v2', credentials=creds)
        user_info = service.userinfo().get().execute()
        email = user_info['email']
        name = user_info.get('name', email.split('@')[0])

        # Find or create user
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(
                email=email,
                access_token=encrypt_token(token_data['access_token']),
                refresh_token=encrypt_token(token_data['refresh_token']) if token_data.get('refresh_token') else ""
            )
            db.add(user)
        else:
            user.access_token = encrypt_token(token_data['access_token'])
            if token_data.get('refresh_token'):
                user.refresh_token = encrypt_token(token_data['refresh_token'])
        
        db.commit()
        db.refresh(user)

        jwt_token = create_access_token(data={"sub": str(user.id)})
        
        return {
            "user_id": user.id,
            "email": user.email,
            "name": name,
            "access_token": jwt_token
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))
