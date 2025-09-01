from dotenv import load_dotenv
import os

load_dotenv()

# Razorpay
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")

# Hugging Face
HF_API_KEY = os.getenv("HF_API_KEY")

# Firebase (optional)
FIREBASE_API_KEY = os.getenv("FIREBASE_API_KEY")
FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID")

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "inkaway.db")
