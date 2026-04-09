import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

print(f"Testing connection to: {url}")
try:
    supabase = create_client(url, key)
    # Try a simple select that doesn't necessarily need a table
    # But wait, Supabase python client needs a source. 
    # Let's try to select from 'clinics' which we know should exist.
    res = supabase.table("clinics").select("count", count="exact").limit(1).execute()
    print("Connection successful!")
    print(f"Data: {res.data}")
except Exception as e:
    print(f"Connection failed: {e}")
