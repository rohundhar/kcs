import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'a-very-secret-key')
    MONGO_URI = os.environ.get('MONGODB_URI')
    DB_NAME = os.environ.get('DATABASE_NAME')