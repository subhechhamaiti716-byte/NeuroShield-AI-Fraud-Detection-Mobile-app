from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import json
from typing import List
from datetime import datetime

from .db import database, models
from .core import security
from .ml.detector import fraud_detector
from . import schemas
from fastapi.responses import JSONResponse
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables on startup
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="NeuroShield AI")

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global Error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please try again later."},
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check(db: Session = Depends(database.get_db)):
    db_status = "connected"
    try:
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
    except Exception:
        db_status = "disconnected"

    return {
        "status": "online",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "database": db_status,
            "ai_engine": "loaded",
            "websocket_manager": "active"
        },
        "message": "NeuroShield AI is protecting your transactions!"
    }

# Connection Manager for WebSockets
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_alert(self, message: dict, user_id: int):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_text(json.dumps(message))

manager = ConnectionManager()

@app.post("/signup", response_model=schemas.APIResponse)
def signup(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = security.get_password_hash(user.password)
    db_user = models.User(email=user.email, full_name=user.full_name, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    # Log Signup
    signup_log = models.SystemLog(user_id=db_user.id, action="SIGNUP", details=f"New account created for {user.email}")
    db.add(signup_log)
    db.commit()
    db.refresh(db_user)
    return {"status": "success", "message": "User registered successfully", "data": db_user}

@app.post("/token", response_model=schemas.APIResponse)
def login(form_data: schemas.UserLogin, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.email).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = security.create_access_token(data={"sub": user.email})
    
    # Log Login Activity
    login_log = models.SystemLog(user_id=user.id, action="LOGIN", details=f"Logged in via {form_data.email}")
    db.add(login_log)
    db.commit()

    return {
        "status": "success", 
        "message": "Login successful", 
        "data": {"access_token": access_token, "token_type": "bearer"}
    }

@app.post("/transactions/", response_model=schemas.Transaction)
async def create_transaction(
    transaction: schemas.TransactionCreate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    # ML Analysis
    prev_count = db.query(models.Transaction).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.device_id == transaction.device_id
    ).count()
    
    device_info = {
        "is_known": prev_count > 0,
        "device_id": transaction.device_id,
        "model": transaction.device_model
    }
    
    # IP-based Location Fallback (Simulated)
    lat = transaction.latitude
    lon = transaction.longitude
    if lat == 0 and lon == 0:
        # Mock IP Geolocation logic
        logger.info("GPS missing, falling back to IP Geolocation...")
        lat, lon = 28.6139, 77.2090 # Delhi coordinates (simulated fallback)
    
    score, is_fraud = fraud_detector.predict(
        current_user.id,
        transaction.amount, 
        datetime.utcnow(), 
        lat, 
        lon, 
        device_info
    )

    db_tx = models.Transaction(
        **transaction.dict(),
        user_id=current_user.id,
        fraud_score=score,
        is_fraud=is_fraud,
        status="suspicious" if is_fraud else "normal"
    )
    db.add(db_tx)
    db.commit()
    db.refresh(db_tx)

    # Log Security Activity
    if is_fraud:
        fraud_log = models.SystemLog(user_id=current_user.id, action="FRAUD_DETECTED", details=f"Tx #{db_tx.id} flagged with score {score}")
        db.add(fraud_log)
        db.commit()

    if is_fraud:
        await manager.send_alert({
            "type": "FRAUD_ALERT",
            "transaction_id": db_tx.id,
            "amount": db_tx.amount,
            "location": db_tx.location,
            "score": score,
            "time": db_tx.timestamp.strftime("%I:%M %p")
        }, current_user.id)

    return {"status": "success", "message": "Transaction processed", "data": db_tx}

@app.get("/transactions/", response_model=List[schemas.Transaction])
def get_transactions(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    txs = db.query(models.Transaction).filter(models.Transaction.user_id == current_user.id).order_by(models.Transaction.timestamp.desc()).all()
    return {"status": "success", "data": txs}

@app.post("/transactions/feedback")
def submit_feedback(
    feedback: schemas.FraudFeedback,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    tx = db.query(models.Transaction).filter(
        models.Transaction.id == feedback.transaction_id,
        models.Transaction.user_id == current_user.id
    ).first()
    
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    tx.user_feedback = feedback.feedback
    tx.status = "confirmed_safe" if feedback.feedback == "YES" else "confirmed_fraud"
    
    # Update ML engine with feedback
    fraud_detector.add_feedback(
        current_user.id, 
        tx.amount, 
        tx.timestamp, 
        tx.latitude, 
        tx.longitude, 
        feedback.feedback == "NO" # was_fraud is True if feedback is "NO" (report fraud)
    )
    
    # Log Feedback
    feedback_log = models.SystemLog(user_id=current_user.id, action="FEEDBACK_SUBMITTED", details=f"User marked Tx #{tx.id} as {tx.status}")
    db.add(feedback_log)
    db.commit()
    return {"status": "success", "message": "Feedback recorded successfully"}

@app.get("/analytics")
def analytics(db: Session = Depends(database.get_db), current_user: models.User = Depends(security.get_current_user)):
    txs = db.query(models.Transaction).filter(models.Transaction.user_id == current_user.id).all()
    
    # Build category breakdown
    category_breakdown = {}
    for t in txs:
        category_breakdown[t.category] = category_breakdown.get(t.category, 0) + t.amount

    return {
        "status": "success",
        "data": {
            "total_balance": 124500.0,
            "total_spent": sum(t.amount for t in txs),
            "fraud_risk_level": "Low" if sum(1 for t in txs if t.is_fraud) < 2 else "Medium",
            "safe_percentage": (sum(1 for t in txs if not t.is_fraud) / len(txs) * 100) if txs else 100,
            "category_breakdown": category_breakdown,
            "total_transactions": len(txs),
            "flagged_transactions": sum(1 for t in txs if t.is_fraud)
        }
    }

@app.websocket("/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str, db: Session = Depends(database.get_db)):
    try:
        user = await security.get_current_user(token, db)
        await manager.connect(user.id, websocket)
        try:
            while True:
                await websocket.receive_text()
        except WebSocketDisconnect:
            manager.disconnect(user.id)
    except:
        await websocket.close(code=1008)

@app.post("/webhooks/razorpay")
async def razorpay_webhook(data: dict, db: Session = Depends(database.get_db)):
    # In a real app, verify signature here
    logger.info(f"Received Razorpay Webhook: {json.dumps(data)}")
    
    event = data.get("event")
    if event == "payment.captured":
        payload = data.get("payload", {}).get("payment", {}).get("entity", {})
        amount = payload.get("amount", 0) / 100 # Razorpay amounts are in paise
        email = payload.get("email")
        
        # Find user by email
        user = db.query(models.User).filter(models.User.email == email).first()
        if user:
            # Simulate transaction metadata (usually provided in webhook notes or captured from session)
            lat = data.get("notes", {}).get("lat", 12.9716)
            lon = data.get("notes", {}).get("lon", 77.5946)
            
            score, is_fraud = fraud_detector.predict(
                user.id, amount, datetime.utcnow(), lat, lon, {"is_known": True}
            )
            
            db_tx = models.Transaction(
                user_id=user.id,
                amount=amount,
                category="Online Payment",
                location="Razorpay Gateway",
                latitude=lat,
                longitude=lon,
                device_id="razorpay_webhook",
                device_model="Webhook Integration",
                os_version="N/A",
                fraud_score=score,
                is_fraud=is_fraud,
                status="suspicious" if is_fraud else "normal"
            )
            db.add(db_tx)
            db.commit()
            
            if is_fraud:
                await manager.send_alert({
                    "type": "FRAUD_ALERT",
                    "transaction_id": db_tx.id,
                    "amount": db_tx.amount,
                    "location": "Online / Webhook",
                    "score": score,
                    "time": datetime.utcnow().strftime("%I:%M %p")
                }, user.id)
                
    return {"status": "processed"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
