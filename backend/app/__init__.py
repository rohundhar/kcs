from flask import Flask
from pymongo import MongoClient
from flask_cors import CORS
from config import Config
import certifi
import os

db = None

def create_app():
    global db
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Enable CORS for frontend requests
    frontend_url = os.environ.get('FRONTEND_URL')
    if frontend_url:
        CORS(app, origins=[frontend_url])
    else:
        CORS(app) # Fallback for local development

    try:
        client = MongoClient(app.config['MONGO_URI'], tlsCAFile=certifi.where())
        
        app.extensions['pymongo_db'] = client[app.config['DB_NAME']]
        db = app.extensions['pymongo_db']        # Pre-populate default relationship types if they don't exist

        init_relationship_types()
        print("Successfully connected to MongoDB.")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")

    with app.app_context():
        from . import routes

    return app

def init_relationship_types():
    relationship_types_collection = db.relationshipTypes
    default_types = [
        {"label": "supports", "color": "#4CAF50", "isDefault": True},
        {"label": "contradicts", "color": "#F44336", "isDefault": True},
        {"label": "is an example of", "color": "#2196F3", "isDefault": True}
    ]

    for rel_type in default_types:
        if not relationship_types_collection.find_one({"label": rel_type["label"], "isDefault": True}):
            relationship_types_collection.insert_one(rel_type)
    print("Default relationship types initialized.")