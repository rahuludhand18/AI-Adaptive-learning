import os
import random
import google.generativeai as genai

def get_random_gemini_key():
    keys_string = os.getenv("GEMINI_API_KEYS", "")
    if not keys_string:
        # Fallback to the single GEMINI_API_KEY if the team pool isn't set up yet
        single_key = os.getenv("GEMINI_API_KEY", "")
        if not single_key:
            raise ValueError("No Gemini keys found in .env (tried GEMINI_API_KEYS and GEMINI_API_KEY)")
        return single_key
    
    keys_list = [key.strip() for key in keys_string.split(",")]
    return random.choice(keys_list)
