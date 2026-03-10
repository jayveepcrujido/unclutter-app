from cryptography.fernet import Fernet
import os
from dotenv import load_dotenv

load_dotenv()

# In a real app, this should be a 32-byte base64-encoded string
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")

if not ENCRYPTION_KEY:
    # For development, if not provided, generate one but log it (should be in .env)
    # ENCRYPTION_KEY = Fernet.generate_key().decode()
    # print(f"WARNING: ENCRYPTION_KEY not found in .env. Use this for development: {ENCRYPTION_KEY}")
    raise ValueError("ENCRYPTION_KEY must be set in .env")

fernet = Fernet(ENCRYPTION_KEY.encode())

def encrypt_token(token: str) -> str:
    return fernet.encrypt(token.encode()).decode()

def decrypt_token(encrypted_token: str) -> str:
    return fernet.decrypt(encrypted_token.encode()).decode()
