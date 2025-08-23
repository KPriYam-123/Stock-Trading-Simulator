from sqlalchemy.orm import Session
from models.user import User, WalletTransaction
from schemas.user import UserCreate, WalletUpdate
from auth import get_password_hash, verify_password
from fastapi import HTTPException, status
from decimal import Decimal

class UserService:
    def __init__(self, db: Session):
        self.db = db

    def create_user(self, user: UserCreate):
        # Check if username already exists
        db_user = self.db.query(User).filter(User.username == user.username).first()
        if db_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )
        
        # Check if email already exists
        db_user = self.db.query(User).filter(User.email == user.email).first()
        if db_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        hashed_password = get_password_hash(user.password)
        db_user = User(
            username=user.username,
            email=user.email,
            hashed_password=hashed_password
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        
        # Create initial wallet transaction
        self._create_wallet_transaction(
            user_id=db_user.id,
            transaction_type="deposit",
            amount=Decimal("10000.00"),
            balance_after=Decimal("10000.00"),
            description="Initial wallet balance"
        )
        
        return db_user

    def authenticate_user(self, username: str, password: str):
        user = self.db.query(User).filter(User.username == username).first()
        if not user:
            return False
        if not verify_password(password, user.hashed_password):
            return False
        return user

    def get_user_by_username(self, username: str):
        return self.db.query(User).filter(User.username == username).first()

    def get_user_by_id(self, user_id: int):
        return self.db.query(User).filter(User.id == user_id).first()

    def update_wallet_balance(self, user_id: int, wallet_update: WalletUpdate):
        user = self.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        if wallet_update.transaction_type == "withdrawal" and user.wallet_balance < wallet_update.amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient balance"
            )

        if wallet_update.transaction_type == "deposit":
            new_balance = user.wallet_balance + wallet_update.amount
        elif wallet_update.transaction_type == "withdrawal":
            new_balance = user.wallet_balance - wallet_update.amount
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid transaction type"
            )

        user.wallet_balance = new_balance
        self.db.commit()
        self.db.refresh(user)

        # Create wallet transaction record
        transaction = self._create_wallet_transaction(
            user_id=user_id,
            transaction_type=wallet_update.transaction_type,
            amount=wallet_update.amount,
            balance_after=new_balance,
            description=wallet_update.description
        )

        return transaction

    def get_wallet_transactions(self, user_id: int, limit: int = 10):
        return (
            self.db.query(WalletTransaction)
            .filter(WalletTransaction.user_id == user_id)
            .order_by(WalletTransaction.created_at.desc())
            .limit(limit)
            .all()
        )

    def _create_wallet_transaction(self, user_id: int, transaction_type: str, amount: Decimal, balance_after: Decimal, description: str = None):
        transaction = WalletTransaction(
            user_id=user_id,
            transaction_type=transaction_type,
            amount=amount,
            balance_after=balance_after,
            description=description
        )
        self.db.add(transaction)
        self.db.commit()
        self.db.refresh(transaction)
        return transaction
