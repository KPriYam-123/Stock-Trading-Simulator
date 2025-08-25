from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from decimal import Decimal
from datetime import datetime

from database import get_db
from routers.user import get_current_user
from models.user import User

router = APIRouter(prefix="/trades", tags=["trades"])

class TradeRequest(BaseModel):
    symbol: str
    quantity: int
    order_type: str  # 'buy' or 'sell'
    price_type: str  # 'market' or 'limit'
    limit_price: Optional[Decimal] = None

class TradeResponse(BaseModel):
    id: str
    symbol: str
    quantity: int
    order_type: str
    price: Decimal
    total: Decimal
    status: str
    timestamp: datetime

# Mock trade storage (in real app, this would be a database)
mock_trades = []

@router.post("/place-order", response_model=TradeResponse)
async def place_order(
    trade_request: TradeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Place a buy or sell order"""
    
    # Mock stock prices (in real app, get from market data service)
    mock_prices = {
        'AAPL': 175.50, 'GOOGL': 2845.20, 'MSFT': 378.90, 'TSLA': 245.67,
        'AMZN': 3456.78, 'NVDA': 456.32, 'META': 324.15, 'NFLX': 456.78
    }
    
    if trade_request.symbol not in mock_prices:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid stock symbol"
        )
    
    # Determine execution price
    if trade_request.price_type == 'market':
        execution_price = Decimal(str(mock_prices[trade_request.symbol]))
    else:
        execution_price = trade_request.limit_price
    
    total = execution_price * trade_request.quantity
    
    # Check wallet balance for buy orders
    if trade_request.order_type == 'buy':
        if total > current_user.wallet_balance:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient funds"
            )
    
    # Create mock trade record
    trade_id = f"TRD_{len(mock_trades) + 1:06d}"
    trade = TradeResponse(
        id=trade_id,
        symbol=trade_request.symbol,
        quantity=trade_request.quantity,
        order_type=trade_request.order_type,
        price=execution_price,
        total=total,
        status="executed",
        timestamp=datetime.now()
    )
    
    mock_trades.append(trade)
    
    return trade

@router.get("/history", response_model=List[TradeResponse])
async def get_trade_history(
    limit: int = 10,
    current_user: User = Depends(get_current_user)
):
    """Get user's trade history"""
    # In real app, filter by user_id
    return mock_trades[-limit:]

@router.get("/positions")
async def get_positions(
    current_user: User = Depends(get_current_user)
):
    """Get current stock positions"""
    # Mock positions (in real app, calculate from trade history)
    positions = [
        {"symbol": "AAPL", "quantity": 10, "avg_price": 170.25},
        {"symbol": "GOOGL", "quantity": 2, "avg_price": 2800.00},
        {"symbol": "MSFT", "quantity": 5, "avg_price": 365.50}
    ]
    return positions
