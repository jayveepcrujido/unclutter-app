# unclutter/backend/check_env.py
import os
from dotenv import load_dotenv

load_dotenv()

client_id = os.getenv("GOOGLE_CLIENT_ID")
client_secret = os.getenv("GOOGLE_CLIENT_SECRET")

if not client_id or not client_secret:
     print("❌ ERROR: Variables are NOT being loaded from .env")
else:
     print(f"✅ Loaded ID starting with: {client_id[:5]}...")
     print(f"✅ Loaded Secret starting with: {client_secret[:5]}...")