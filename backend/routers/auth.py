from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from datetime import timedelta
from typing import Dict, Optional
import bcrypt

from auth import create_access_token, verify_token, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# In-memory user storage for testing (replace with database in production)
mock_users_db: Dict[str, dict] = {}

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class User(BaseModel):
    id: int
    username: str
    email: str
    wallet_balance: float
    is_active: bool

class Token(BaseModel):
    access_token: str
    token_type: str

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    username = verify_token(token, credentials_exception)
    user = mock_users_db.get(username)
    if user is None:
        raise credentials_exception
    return user

@router.post("/register", response_model=User)
def register_user(user_data: UserCreate):
    """Register a new user"""
    # Check if user already exists
    if user_data.username in mock_users_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email already exists
    for user in mock_users_db.values():
        if user['email'] == user_data.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    # Hash password and create user
    hashed_password = hash_password(user_data.password)
    user_id = len(mock_users_db) + 1
    
    new_user = {
        "id": user_id,
        "username": user_data.username,
        "email": user_data.email,
        "hashed_password": hashed_password,
        "wallet_balance": 10000.0,  # Starting balance
        "is_active": True
    }
    
    mock_users_db[user_data.username] = new_user
    
    # Return user without password
    return User(
        id=new_user["id"],
        username=new_user["username"],
        email=new_user["email"],
        wallet_balance=new_user["wallet_balance"],
        is_active=new_user["is_active"]
    )

@router.post("/login", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login and get access token"""
    user = mock_users_db.get(form_data.username)
    
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user["is_active"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=User)
def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    return User(
        id=current_user["id"],
        username=current_user["username"],
        email=current_user["email"],
        wallet_balance=current_user["wallet_balance"],
        is_active=current_user["is_active"]
    )

@router.put("/wallet/update")
def update_wallet_balance(
    amount: float,
    transaction_type: str,  # 'deposit', 'withdrawal', 'trade'
    current_user: dict = Depends(get_current_user)
):
    """Update user wallet balance"""
    if transaction_type == "withdrawal" and current_user["wallet_balance"] < amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient funds"
        )
    
    if transaction_type == "deposit":
        mock_users_db[current_user["username"]]["wallet_balance"] += amount
    elif transaction_type == "withdrawal":
        mock_users_db[current_user["username"]]["wallet_balance"] -= amount
    elif transaction_type == "trade":
        mock_users_db[current_user["username"]]["wallet_balance"] += amount  # Can be negative for purchases
    
    new_balance = mock_users_db[current_user["username"]]["wallet_balance"]
    
    return {
        "message": f"{transaction_type.title()} successful",
        "new_balance": new_balance,
        "amount": amount
    }
