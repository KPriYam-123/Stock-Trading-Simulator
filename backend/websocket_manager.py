from fastapi import WebSocket, WebSocketDisconnect
import json
import asyncio
import random
from typing import List

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                # Remove disconnected connections
                self.active_connections.remove(connection)

manager = ConnectionManager()

# Mock stock data
stock_data = {
    'AAPL': {'price': 175.50, 'change': 2.45},
    'GOOGL': {'price': 2845.20, 'change': -15.30},
    'MSFT': {'price': 378.90, 'change': 8.75},
    'TSLA': {'price': 245.67, 'change': -5.23},
    'AMZN': {'price': 3456.78, 'change': 23.45},
    'NVDA': {'price': 456.32, 'change': 12.87},
    'META': {'price': 324.15, 'change': -7.89},
    'NFLX': {'price': 456.78, 'change': 15.23},
}

async def get_stock_updates():
    """Generate random stock price updates"""
    while True:
        # Update prices randomly
        for symbol in stock_data:
            change = random.uniform(-2.0, 2.0)
            stock_data[symbol]['price'] = max(0.01, stock_data[symbol]['price'] + change)
            stock_data[symbol]['change'] = change
            
        # Broadcast to all connected clients
        await manager.broadcast(json.dumps({
            'type': 'price_update',
            'data': stock_data
        }))
        
        await asyncio.sleep(2)  # Update every 2 seconds

async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    
    # Start broadcasting price updates
    update_task = asyncio.create_task(get_stock_updates())
    
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        update_task.cancel()
