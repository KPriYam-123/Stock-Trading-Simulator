from fastapi import FastAPI
from database import engine, Base
from routers import user

app = FastAPI(title="Stock Trading Simulator", version="1.0.0")

# Include routers
app.include_router(user.router)

@app.on_event("startup")
async def startup_event():
    """Initialize database tables on startup"""
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")
    except Exception as e:
        print(f"⚠️ Database connection failed: {e}")
        print("📝 Make sure PostgreSQL is running with docker-compose up db -d")

@app.get("/")
def root():
    return {"message": "Stock Trading Simulator Backend"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
