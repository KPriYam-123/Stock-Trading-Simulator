from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from typing import List, Optional
from decimal import Decimal
from datetime import datetime, timedelta
import random

from routers.auth import get_current_user

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
    current_user: dict = Depends(get_current_user)
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
    current_user: dict = Depends(get_current_user)
):
    """Get user's trade history"""
    # In real app, filter by user_id
    return mock_trades[-limit:]

@router.get("/positions")
async def get_positions(
    current_user: dict = Depends(get_current_user)
):
    """Get current stock positions"""
    # Mock positions (in real app, calculate from trade history)
    positions = [
        {"symbol": "AAPL", "quantity": 10, "avg_price": 170.25},
        {"symbol": "GOOGL", "quantity": 2, "avg_price": 2800.00},
        {"symbol": "MSFT", "quantity": 5, "avg_price": 365.50}
    ]
    return positions

# Portfolio Analytics Endpoints
@router.get("/portfolio/holdings")
async def get_portfolio_holdings(
    current_user: dict = Depends(get_current_user)
):
    """Get detailed portfolio holdings with current market values"""
    mock_prices = {
        'AAPL': 175.50, 'GOOGL': 2845.20, 'MSFT': 378.90, 'TSLA': 245.67,
        'AMZN': 3456.78, 'NVDA': 456.32, 'META': 324.15, 'NFLX': 456.78
    }
    
    holdings = [
        {
            "symbol": "AAPL",
            "shares": 50,
            "avgCost": 150.25,
            "currentPrice": mock_prices['AAPL'],
            "marketValue": 50 * mock_prices['AAPL'],
            "gainLoss": (mock_prices['AAPL'] - 150.25) * 50,
            "gainLossPercent": ((mock_prices['AAPL'] - 150.25) / 150.25) * 100
        },
        {
            "symbol": "GOOGL",
            "shares": 25,
            "avgCost": 2700.80,
            "currentPrice": mock_prices['GOOGL'],
            "marketValue": 25 * mock_prices['GOOGL'],
            "gainLoss": (mock_prices['GOOGL'] - 2700.80) * 25,
            "gainLossPercent": ((mock_prices['GOOGL'] - 2700.80) / 2700.80) * 100
        },
        {
            "symbol": "MSFT",
            "shares": 30,
            "avgCost": 355.50,
            "currentPrice": mock_prices['MSFT'],
            "marketValue": 30 * mock_prices['MSFT'],
            "gainLoss": (mock_prices['MSFT'] - 355.50) * 30,
            "gainLossPercent": ((mock_prices['MSFT'] - 355.50) / 355.50) * 100
        }
    ]
    
    return holdings

@router.get("/portfolio/performance")
async def get_portfolio_performance(
    current_user: dict = Depends(get_current_user)
):
    """Get portfolio performance metrics"""
    return {
        "totalValue": 125450.75,
        "dayGainLoss": 2834.50,
        "dayGainLossPercent": 2.31,
        "totalGainLoss": 15750.25,
        "totalGainLossPercent": 14.35,
        "totalInvested": 109700.50
    }

@router.get("/portfolio/pnl")
async def get_portfolio_pnl(
    period: str = Query("1M", description="Time period: 1D, 1W, 1M, 3M, 6M, 1Y"),
    current_user: dict = Depends(get_current_user)
):
    """Get portfolio profit/loss data over time"""
    days_map = {"1D": 1, "1W": 7, "1M": 30, "3M": 90, "6M": 180, "1Y": 365}
    days = days_map.get(period, 30)
    
    pnl_data = []
    base_value = 100000
    
    for i in range(days):
        date = datetime.now() - timedelta(days=days-i-1)
        # Simulate portfolio growth with some volatility
        daily_change = random.uniform(-2, 3)  # -2% to +3% daily change
        base_value *= (1 + daily_change / 100)
        
        pnl_data.append({
            "date": date.strftime("%Y-%m-%d"),
            "value": round(base_value, 2),
            "gainLoss": round(base_value - 100000, 2),
            "gainLossPercent": round(((base_value - 100000) / 100000) * 100, 2)
        })
    
    return pnl_data

@router.get("/portfolio/allocation")
async def get_portfolio_allocation(
    current_user: dict = Depends(get_current_user)
):
    """Get portfolio allocation by stock"""
    return [
        {"name": "AAPL", "value": 8775, "percentage": 35.1},
        {"name": "GOOGL", "value": 7113, "percentage": 28.4},
        {"name": "MSFT", "value": 5367, "percentage": 21.5},
        {"name": "TSLA", "value": 2456, "percentage": 9.8},
        {"name": "Cash", "value": 1289, "percentage": 5.2}
    ]

@router.get("/portfolio/value-history")
async def get_portfolio_value_history(
    period: str = Query("1M", description="Time period: 1D, 1W, 1M, 3M, 6M, 1Y"),
    current_user: dict = Depends(get_current_user)
):
    """Get portfolio value history over time"""
    days_map = {"1D": 1, "1W": 7, "1M": 30, "3M": 90, "6M": 180, "1Y": 365}
    days = days_map.get(period, 30)
    
    value_history = []
    base_value = 100000
    
    for i in range(days):
        date = datetime.now() - timedelta(days=days-i-1)
        # Simulate portfolio growth
        daily_change = random.uniform(-1.5, 2.5)
        base_value *= (1 + daily_change / 100)
        
        value_history.append({
            "date": date.strftime("%Y-%m-%d"),
            "value": round(base_value, 2)
        })
    
    return value_history

# Analytics Endpoints
@router.get("/analytics/stock-history/{symbol}")
async def get_stock_history(
    symbol: str,
    period: str = Query("1M", description="Time period: 1D, 1W, 1M, 3M, 6M, 1Y"),
    current_user: dict = Depends(get_current_user)
):
    """Get stock price history for charts"""
    days_map = {"1D": 1, "1W": 7, "1M": 30, "3M": 90, "6M": 180, "1Y": 365}
    days = days_map.get(period, 30)
    
    history = []
    base_price = 150.0  # Starting price
    
    for i in range(days):
        date = datetime.now() - timedelta(days=days-i-1)
        
        # Simulate price movement
        daily_change = random.uniform(-5, 5)
        base_price += daily_change
        base_price = max(10, base_price)  # Minimum price
        
        volume = random.randint(500000, 2000000)
        
        history.append({
            "date": date.strftime("%Y-%m-%d"),
            "open": round(base_price - random.uniform(-2, 2), 2),
            "high": round(base_price + random.uniform(0, 5), 2),
            "low": round(base_price - random.uniform(0, 5), 2),
            "close": round(base_price, 2),
            "volume": volume
        })
    
    return history

@router.get("/analytics/moving-averages/{symbol}")
async def get_moving_averages(
    symbol: str,
    periods: str = Query("20,50,200", description="Comma-separated periods"),
    current_user: dict = Depends(get_current_user)
):
    """Get moving averages for a stock"""
    period_list = [int(p) for p in periods.split(',')]
    
    # Generate mock price data
    prices = []
    base_price = 150.0
    for i in range(200):  # Generate 200 days of data
        base_price += random.uniform(-3, 3)
        prices.append(base_price)
    
    # Calculate moving averages
    moving_averages = {}
    for period in period_list:
        ma_values = []
        for i in range(period - 1, len(prices)):
            ma = sum(prices[i - period + 1:i + 1]) / period
            ma_values.append(round(ma, 2))
        moving_averages[f'ma{period}'] = ma_values
    
    return moving_averages

@router.get("/analytics/volume-trends/{symbol}")
async def get_volume_trends(
    symbol: str,
    period: str = Query("1M", description="Time period"),
    current_user: dict = Depends(get_current_user)
):
    """Get volume trends for a stock"""
    days_map = {"1D": 1, "1W": 7, "1M": 30, "3M": 90, "6M": 180, "1Y": 365}
    days = days_map.get(period, 30)
    
    volume_data = []
    for i in range(days):
        date = datetime.now() - timedelta(days=days-i-1)
        volume = random.randint(500000, 2000000)
        avg_volume = 1000000
        
        volume_data.append({
            "date": date.strftime("%Y-%m-%d"),
            "volume": volume,
            "avgVolume": avg_volume
        })
    
    return volume_data

@router.get("/analytics/technical-indicators/{symbol}")
async def get_technical_indicators(
    symbol: str,
    current_user: dict = Depends(get_current_user)
):
    """Get technical indicators for a stock"""
    return {
        "rsi": round(random.uniform(30, 70), 2),
        "macd": {
            "macd": round(random.uniform(-2, 2), 2),
            "signal": round(random.uniform(-2, 2), 2),
            "histogram": round(random.uniform(-1, 1), 2)
        },
        "bollingerBands": {
            "upper": round(random.uniform(160, 180), 2),
            "middle": round(random.uniform(150, 160), 2),
            "lower": round(random.uniform(140, 150), 2)
        }
    }

@router.get("/analytics/market-overview")
async def get_market_overview(
    current_user: dict = Depends(get_current_user)
):
    """Get market overview data"""
    return {
        "sp500": {"value": 4185.47, "change": 1.2},
        "nasdaq": {"value": 12846.81, "change": 2.1},
        "dow": {"value": 33745.40, "change": -0.5},
        "vix": {"value": 18.52, "change": -3.2}
    }

@router.get("/analytics/sector-performance")
async def get_sector_performance(
    current_user: dict = Depends(get_current_user)
):
    """Get sector performance data"""
    return [
        {"sector": "Technology", "performance": 12.5},
        {"sector": "Healthcare", "performance": 8.3},
        {"sector": "Finance", "performance": -2.1},
        {"sector": "Energy", "performance": 15.7},
        {"sector": "Consumer", "performance": 6.2},
        {"sector": "Industrial", "performance": 4.8},
        {"sector": "Utilities", "performance": 3.1},
        {"sector": "Real Estate", "performance": 9.4}
    ]
