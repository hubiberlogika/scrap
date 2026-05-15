import os
import sys

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app import create_app

app = create_app()

# This is the WSGI entrypoint for Vercel Serverless Functions
