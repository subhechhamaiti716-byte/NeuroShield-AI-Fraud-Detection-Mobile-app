from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    transactions = relationship("Transaction", back_populates="owner")
    logs = relationship("SystemLog", back_populates="owner")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Float)
    type = Column(String, default="Expense") # Income or Expense
    currency = Column(String, default="INR")
    category = Column(String)
    location = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    device_id = Column(String)
    device_model = Column(String)
    os_version = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Fraud related fields
    fraud_score = Column(Float, default=0.0)
    is_fraud = Column(Boolean, default=False)
    status = Column(String, default="normal") # normal, suspicious, confirmed_fraud, confirmed_safe
    user_feedback = Column(String, nullable=True) # "YES" (it's me), "NO" (fraud)

    owner = relationship("User", back_populates="transactions")

class SystemLog(Base):
    __tablename__ = "system_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String) # LOGIN, SIGNUP, FRAUD_ALERT, AI_RETRAIN
    details = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="logs")

# Update User model to include logs
# (Make sure User model has: logs = relationship("SystemLog", back_populates="owner"))
