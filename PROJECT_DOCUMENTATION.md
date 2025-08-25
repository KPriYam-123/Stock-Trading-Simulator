# 📈 Stock Trading Simulator - Complete Project Documentation

## 🚀 Project Overview

**Stock Trading Simulator** is a full-stack web application that simulates real-time stock trading with live market data, user authentication, portfolio management, and comprehensive trading operations. Built with modern technologies and best practices.

### 🎯 Key Features
- **Real-time Stock Price Updates** with WebSocket simulation
- **Complete Trading System** (Buy/Sell orders with Market/Limit types)
- **Portfolio Management** with P&L tracking and performance analytics
- **Wallet Management** with deposit/withdrawal operations
- **User Authentication** with JWT tokens and secure sessions
- **Redux State Management** for predictable state updates
- **Responsive Design** with modern CSS Grid layouts

---

## 🏗️ Architecture Overview

```
Stock Trading Simulator
├── Backend (FastAPI + PostgreSQL)
│   ├── Authentication & Authorization
│   ├── User Management & Wallet Operations
│   ├── Trading Engine & Order Processing
│   ├── Market Data Simulation
│   └── WebSocket Real-time Updates
│
└── Frontend (React 18 + Redux Toolkit)
    ├── Authentication UI (Login/Register)
    ├── Trading Dashboard
    ├── Portfolio Management
    ├── Real-time Price Display
    └── Wallet Operations
```

---

## 📁 Project Structure

```
TradingAPP/
├── 📂 backend/                    # FastAPI Backend
│   ├── 📂 models/                 # SQLAlchemy Database Models
│   │   ├── __init__.py
│   │   └── user.py               # User & WalletTransaction models
│   ├── 📂 routers/               # API Route Handlers
│   │   ├── __init__.py
│   │   ├── user.py              # User authentication & wallet routes
│   │   └── trade.py             # Trading operations & portfolio routes
│   ├── 📂 schemas/              # Pydantic Request/Response Models
│   │   ├── __init__.py
│   │   └── user.py              # User validation schemas
│   ├── 📂 services/             # Business Logic Layer
│   │   ├── __init__.py
│   │   └── user_service.py      # User operations & wallet management
│   ├── 📄 main.py               # FastAPI application entry point
│   ├── 📄 auth.py               # JWT authentication utilities
│   ├── 📄 database.py           # Database configuration & connection
│   ├── 📄 websocket_manager.py  # WebSocket connection management
│   ├── 📄 requirements.txt      # Python dependencies
│   └── 📄 Dockerfile           # Backend containerization
│
├── 📂 frontend/                  # React Frontend
│   ├── 📂 public/              # Static assets
│   │   ├── index.html
│   │   └── manifest.json
│   ├── 📂 src/                 # Source code
│   │   ├── 📂 components/      # React Components
│   │   │   ├── Dashboard.js    # Main trading dashboard
│   │   │   ├── Login.js       # User login form
│   │   │   ├── Register.js    # User registration form
│   │   │   ├── Navbar.js      # Navigation component
│   │   │   ├── StockList.js   # Live stock price display
│   │   │   ├── TradingForm.js # Buy/Sell order form
│   │   │   ├── Portfolio.js   # Portfolio holdings display
│   │   │   └── WalletManager.js # Wallet operations
│   │   ├── 📂 store/          # Redux Store Configuration
│   │   │   ├── 📂 slices/     # Redux Toolkit Slices
│   │   │   │   ├── authSlice.js      # Authentication state
│   │   │   │   ├── stocksSlice.js    # Stock data & selection
│   │   │   │   ├── portfolioSlice.js # Portfolio holdings
│   │   │   │   └── tradesSlice.js    # Trading operations
│   │   │   ├── index.js       # Store configuration
│   │   │   └── hooks.js       # Typed Redux hooks
│   │   ├── 📂 services/       # API Communication
│   │   │   └── api.js         # Axios configuration & interceptors
│   │   ├── 📄 App.js          # Main React application
│   │   ├── 📄 App.css         # Application styles
│   │   └── 📄 index.js        # React DOM rendering
│   ├── 📄 package.json        # Frontend dependencies
│   └── 📄 package-lock.json   # Dependency lock file
│
├── 📄 docker-compose.yml       # Multi-container orchestration
├── 📄 .gitignore              # Git ignore rules
├── 📄 README.md               # Basic project information
└── 📄 PROJECT_DOCUMENTATION.md # This comprehensive guide
```

---

## 🛠️ Technology Stack

### Backend Technologies
| Technology | Purpose | Version |
|------------|---------|---------|
| **FastAPI** | Web framework | Latest |
| **PostgreSQL** | Primary database | 15+ |
| **SQLAlchemy** | ORM | 2.0+ |
| **Pydantic** | Data validation | 2.0+ |
| **JWT** | Authentication | PyJWT |
| **bcrypt** | Password hashing | Latest |
| **WebSockets** | Real-time updates | Built-in |
| **Uvicorn** | ASGI server | Latest |

### Frontend Technologies
| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI framework | 18+ |
| **Redux Toolkit** | State management | Latest |
| **React Router** | Client-side routing | 6+ |
| **Axios** | HTTP client | Latest |
| **CSS Grid** | Layout system | Native |
| **ES6+** | JavaScript features | Modern |

---

## 🔧 Implementation Details

### 1. Backend Implementation

#### 🔐 Authentication System
```python
# JWT-based authentication with secure password hashing
- Password hashing: bcrypt with salt rounds
- Token generation: JWT with expiration
- Middleware: Automatic token validation
- Session management: Stateless with refresh capability
```

#### 💾 Database Schema
```sql
-- Users table with wallet integration
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR UNIQUE NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    hashed_password VARCHAR NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    wallet_balance NUMERIC(15,2) DEFAULT 10000.00,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Wallet transaction history
CREATE TABLE wallet_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    transaction_type VARCHAR NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    balance_after NUMERIC(15,2) NOT NULL,
    description VARCHAR,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 📊 Trading Engine
```python
# Mock trading system with realistic price simulation
- Real-time price updates every 2 seconds
- Market and Limit order types
- Portfolio tracking with P&L calculations
- Transaction history and audit trail
- Risk management and validation
```

#### 🌐 API Endpoints
```
Authentication:
POST   /auth/register         # User registration
POST   /auth/login           # User login
GET    /users/me             # Get current user profile

Trading:
GET    /stocks               # Get all available stocks
POST   /trades/place-order   # Place buy/sell order
GET    /trades/history       # Get trade history
GET    /portfolio/holdings   # Get portfolio positions

Wallet:
POST   /users/wallet/update  # Deposit/withdraw funds
GET    /users/wallet/history # Transaction history
```

### 2. Frontend Implementation

#### 🏪 Redux Store Architecture
```javascript
// Centralized state management with Redux Toolkit
store/
├── authSlice.js       // User authentication state
├── stocksSlice.js     // Stock data and selection
├── portfolioSlice.js  // Portfolio holdings and P&L
└── tradesSlice.js     // Trading operations and history

// State structure:
{
  auth: { user, token, loading, error },
  stocks: { stocks, selectedStock, loading },
  portfolio: { holdings, totalValue, totalGainLoss },
  trades: { history, positions, loading }
}
```

#### 🎨 Component Architecture
```javascript
// Component hierarchy and data flow
App.js (Redux Provider)
├── Navbar (auth state, logout)
├── Router
    ├── Login (auth actions)
    ├── Register (auth actions)
    └── Dashboard
        ├── StockList (real-time prices)
        ├── TradingForm (order placement)
        ├── Portfolio (holdings display)
        └── WalletManager (balance operations)
```

#### 🔄 State Management Migration
```javascript
// Migrated from Context API to Redux Toolkit
// Benefits achieved:
- Predictable state updates with actions
- Time-travel debugging with Redux DevTools
- Better separation of concerns
- Centralized state accessible from any component
- Optimized re-renders with Redux selectors
```

### 3. Real-time Features

#### 📡 WebSocket Implementation
```python
# Backend WebSocket manager
class WebSocketManager:
    def __init__(self):
        self.active_connections = []
    
    async def connect(self, websocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    async def broadcast_price_update(self, data):
        for connection in self.active_connections:
            await connection.send_json(data)
```

#### ⚡ Live Price Updates
```javascript
// Frontend price update mechanism
// Updates every 2 seconds with realistic market simulation
const updateStockPrices = () => {
  stocks.map(stock => {
    const randomChange = (Math.random() - 0.5) * 5;
    const newPrice = Math.max(0.01, stock.price + randomChange);
    const change = newPrice - stock.price;
    const changePercent = (change / stock.price) * 100;
    
    return { ...stock, price: newPrice, change, changePercent };
  });
};
```

---

## 🚀 Getting Started

### Prerequisites
```bash
# Required software
- Node.js 18+ and npm
- Python 3.8+
- PostgreSQL 12+
- Git
```

### Installation Steps

#### 1. Clone Repository
```bash
git clone https://github.com/KPriYam-123/Stock-Trading-Simulator.git
cd Stock-Trading-Simulator
```

#### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

#### 4. Access Application
```
Frontend: http://localhost:3000
Backend API: http://localhost:8000
API Documentation: http://localhost:8000/docs
```

---

## 🗃️ Database Setup

### Local PostgreSQL Setup
```sql
-- Create database
CREATE DATABASE trading_simulator;

-- Create user
CREATE USER trading_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE trading_simulator TO trading_user;
```

### Environment Variables
```bash
# Backend .env file
DATABASE_URL=postgresql://trading_user:password@localhost/trading_simulator
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

## 🐳 Docker Deployment

### Docker Compose Configuration
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/trading_db
    depends_on:
      - db
  
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
  
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: trading_db
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Deployment Commands
```bash
# Build and start all services
docker-compose up --build

# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## 🧪 Testing

### Backend Testing
```bash
# Run backend tests
cd backend
python -m pytest tests/

# Test API endpoints
curl -X GET http://localhost:8000/stocks
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"testpass"}'
```

### Frontend Testing
```bash
# Run React tests
cd frontend
npm test

# Build production version
npm run build

# Serve production build
npm install -g serve
serve -s build
```

---

## 📊 Features Deep Dive

### 1. Trading System
- **Order Types**: Market orders (immediate execution) and Limit orders (price-specific)
- **Portfolio Tracking**: Real-time P&L calculations and performance metrics
- **Risk Management**: Balance validation and order size limits
- **Transaction History**: Complete audit trail of all trading activities

### 2. User Management
- **Secure Authentication**: JWT tokens with bcrypt password hashing
- **Profile Management**: User settings and account information
- **Wallet Operations**: Deposit, withdrawal, and balance tracking
- **Session Management**: Automatic logout and token refresh

### 3. Market Data
- **Live Price Simulation**: Realistic stock price movements
- **Multiple Stocks**: Diverse portfolio of major companies
- **Real-time Updates**: WebSocket-based price feeds
- **Historical Data**: Price change tracking and trends

### 4. User Interface
- **Responsive Design**: Mobile-friendly CSS Grid layouts
- **Real-time Updates**: Live portfolio and price displays
- **Interactive Forms**: Intuitive trading and wallet operations
- **Error Handling**: User-friendly error messages and validation

---

## 🔒 Security Features

### Backend Security
- **Password Security**: bcrypt hashing with salt rounds
- **JWT Tokens**: Secure token generation and validation
- **CORS Configuration**: Proper cross-origin request handling
- **Input Validation**: Pydantic schema validation
- **SQL Injection Prevention**: SQLAlchemy ORM protection

### Frontend Security
- **Token Storage**: Secure localStorage management
- **API Interceptors**: Automatic token attachment and error handling
- **Route Protection**: Authentication-required pages
- **Input Sanitization**: Form validation and XSS prevention

---

## 🚀 Performance Optimizations

### Backend Optimizations
- **Database Indexing**: Optimized queries on user tables
- **Connection Pooling**: Efficient database connections
- **Async Operations**: Non-blocking request handling
- **Caching**: Redis-ready architecture for future scaling

### Frontend Optimizations
- **Redux Selectors**: Memoized state selections
- **Component Optimization**: React.memo and useCallback usage
- **Bundle Splitting**: Code splitting for faster loading
- **Asset Optimization**: Minimized CSS and JavaScript

---

## 🔮 Future Enhancements

### Planned Features
1. **Advanced Charting**: Technical analysis with Chart.js
2. **Real Market Data**: Integration with financial APIs
3. **Options Trading**: Derivative instruments support
4. **Social Features**: User following and trade sharing
5. **Mobile App**: React Native implementation
6. **Advanced Analytics**: AI-powered trade recommendations

### Technical Improvements
1. **Microservices**: Service decomposition for scalability
2. **Redis Caching**: Performance optimization
3. **WebSocket Scaling**: Real-time connection management
4. **Testing Coverage**: Comprehensive test suites
5. **CI/CD Pipeline**: Automated deployment
6. **Monitoring**: Application performance monitoring

---

## 🤝 Contributing

### Development Workflow
```bash
# Fork the repository
git fork https://github.com/KPriYam-123/Stock-Trading-Simulator.git

# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git commit -m "Add new feature"

# Push and create pull request
git push origin feature/new-feature
```

### Code Standards
- **Backend**: PEP 8 Python style guide
- **Frontend**: ESLint configuration with React best practices
- **Commits**: Conventional commit messages
- **Documentation**: Comprehensive inline comments

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**Lead Developer**: [@KPriYam-123](https://github.com/KPriYam-123)

---

## 📞 Support

For support and questions:
- **GitHub Issues**: [Create an issue](https://github.com/KPriYam-123/Stock-Trading-Simulator/issues)
- **Documentation**: Check this comprehensive guide
- **API Docs**: Visit http://localhost:8000/docs when running

---

## 🎉 Acknowledgments

- **FastAPI**: For the excellent web framework
- **React Team**: For the powerful UI library
- **Redux Toolkit**: For simplified state management
- **PostgreSQL**: For reliable data storage

---

*Last Updated: August 25, 2025*

**Project Status**: ✅ Production Ready - Complete implementation with Redux migration
