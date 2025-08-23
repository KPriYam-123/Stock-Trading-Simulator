# Stock Trading Simulator - User Service

## Overview
The User Service provides authentication, user management, and wallet functionality for the Stock Trading Simulator.

## Features Implemented

### 1. User Authentication
- User registration with username, email, and password
- JWT-based authentication
- Password hashing using bcrypt
- Login endpoint with access token generation

### 2. Wallet Management
- Each user starts with $10,000 initial balance
- Deposit and withdrawal functionality
- Transaction history tracking
- Balance validation for withdrawals

### 3. Database Models
- **Users Table**: Stores user information and wallet balance
- **Wallet Transactions Table**: Tracks all wallet transactions

## API Endpoints

### Authentication
- `POST /users/register` - Register a new user
- `POST /users/token` - Login and get access token
- `GET /users/me` - Get current user profile

### Wallet Management
- `POST /users/wallet/update` - Deposit or withdraw funds
- `GET /users/wallet/transactions` - Get transaction history

## Project Structure
```
backend/
├── models/
│   ├── __init__.py
│   └── user.py          # User and WalletTransaction models
├── schemas/
│   ├── __init__.py
│   └── user.py          # Pydantic schemas for API
├── services/
│   ├── __init__.py
│   └── user_service.py  # Business logic for user operations
├── routers/
│   ├── __init__.py
│   └── user.py          # API endpoints for user operations
├── auth.py              # JWT authentication utilities
├── database.py          # Database configuration
├── init_db.py           # Database initialization script
├── main.py              # FastAPI application entry point
└── requirements.txt     # Python dependencies
```

## Database Schema

### Users Table
- `id` (Primary Key)
- `username` (Unique)
- `email` (Unique)
- `hashed_password`
- `is_active`
- `wallet_balance` (Decimal, default: 10000.00)
- `created_at`
- `updated_at`

### Wallet Transactions Table
- `id` (Primary Key)
- `user_id` (Foreign Key)
- `transaction_type` ('deposit', 'withdrawal', 'trade')
- `amount`
- `balance_after`
- `description`
- `created_at`

## Running the Service

### 1. Start Database Services
```bash
docker-compose up db timescaledb -d
```

### 2. Initialize Database
```bash
python backend/init_db.py
```

### 3. Start Backend Service
```bash
cd backend
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`
Interactive documentation at `http://localhost:8000/docs`

## Example API Usage

### 1. Register a User
```bash
curl -X POST "http://localhost:8000/users/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "trader1",
    "email": "trader1@example.com",
    "password": "securepassword123"
  }'
```

### 2. Login
```bash
curl -X POST "http://localhost:8000/users/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=trader1&password=securepassword123"
```

### 3. Get User Profile
```bash
curl -X GET "http://localhost:8000/users/me" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Deposit Funds
```bash
curl -X POST "http://localhost:8000/users/wallet/update" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "amount": 5000.00,
    "transaction_type": "deposit",
    "description": "Adding more funds"
  }'
```

### 5. Withdraw Funds
```bash
curl -X POST "http://localhost:8000/users/wallet/update" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "amount": 1000.00,
    "transaction_type": "withdrawal",
    "description": "Cash withdrawal"
  }'
```

### 6. Get Transaction History
```bash
curl -X GET "http://localhost:8000/users/wallet/transactions?limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Security Features
- Passwords are hashed using bcrypt
- JWT tokens for stateless authentication
- Input validation using Pydantic schemas
- SQL injection protection via SQLAlchemy ORM

## Next Steps
1. Implement Market Data Ingestion with Kafka
2. Create Trade Service with order matching engine
3. Add portfolio management features
4. Implement real-time market data streaming
