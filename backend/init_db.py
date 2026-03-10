import sys
import os

# Add the current directory to the path so it can find the 'app' module
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base
from app.models import User, Subscription, UnsubscribeAction

print("Creating database tables...")
try:
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully!")
except Exception as e:
    print(f"❌ Error creating tables: {e}")
    print("\nTip: Make sure PostgreSQL is running and your DATABASE_URL in .env is correct.")
