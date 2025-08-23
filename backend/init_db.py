#!/usr/bin/env python3
"""
Database initialization script for the Trading Simulator
"""
from database import engine, Base
from models.user import User, WalletTransaction

def init_db():
    """Initialize the database with all tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    init_db()
