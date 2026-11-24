import os
import random
from pathlib import Path
from dotenv import load_dotenv

# Ensure .env is always loaded from backend root
env_path = Path(__file__).resolve().parent.parent / '.env'
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

def get_random_gemini_key():
    keys_string = os.getenv("GEMINI_API_KEYS", "")
    
    if not keys_string:
        single_key = os.getenv("GEMINI_API_KEY", "")
        if single_key:
            return single_key.strip().strip("\"'")
        else:
            raise ValueError("No Gemini keys found in .env (tried GEMINI_API_KEYS and GEMINI_API_KEY)")
            
    keys_list = [key.strip().strip("\"'") for key in keys_string.split(",") if key.strip().strip("\"'")]
    if not keys_list:
        raise ValueError("No valid Gemini keys found.")
    return random.choice(keys_list)
