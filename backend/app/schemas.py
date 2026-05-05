from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class TransactionBase(BaseModel):
    amount: float
    type: str = "Expense"
    currency: str = "INR"
    category: str
    location: str
    latitude: float
    longitude: float
    device_id: str
    device_model: str
    os_version: str

class TransactionCreate(TransactionBase):
    pass

class Transaction(TransactionBase):
    id: int
    user_id: int
    timestamp: datetime
    fraud_score: float
    is_fraud: bool
    status: str
    user_feedback: Optional[str] = None

    class Config:
        from_attributes = True

class FraudFeedback(BaseModel):
    transaction_id: int
    feedback: str # "YES" or "NO"

# Standard Response Wrapper
class APIResponse(BaseModel):
    status: str = "success"
    message: Optional[str] = None
    data: Optional[Any] = None
