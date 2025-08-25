from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import user, trade
from websocket_manager import websocket_endpoint

app = FastAPI(title="Stock Trading Simulator", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(user.router)
app.include_router(trade.router)

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint_route(websocket: WebSocket):
    await websocket_endpoint(websocket)

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
