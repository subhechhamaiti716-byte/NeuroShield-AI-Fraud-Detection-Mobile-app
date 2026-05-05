# 🛡️ NeuroShield: AI-Powered Fraud Detection System

**NeuroShield** is a next-generation fraud detection platform that uses advanced Machine Learning (Anomaly Detection) to identify and block suspicious financial transactions in real-time. Unlike traditional rule-based systems, NeuroShield learns unique user behavior patterns to provide personalized security.

## 🚀 Key Features

*   **🧠 AI-Driven Detection**: Uses the **Isolation Forest** algorithm to detect anomalies in spending, location, time, and device hardware signatures.
*   **⚡ Real-Time Alerts**: Instant "Suspicious Activity" notifications delivered via **WebSockets** directly to the mobile app.
*   **🌍 Smart Location Tracking**: Monitors GPS coordinates and City-level movements to flag sudden, impossible geographic jumps.
*   **📱 Device Fingerprinting**: Identifies and verifies unique hardware IDs to prevent account takeovers from unknown devices.
*   **🔄 Intelligent Learning Loop**: Learns from user feedback (Yes/No) to refine the AI model and reduce future false positives.
*   **💳 Webhook Integration**: Fully compatible with **Razorpay** and other major payment gateways for seamless transaction monitoring.
*   **📊 Premium Analytics**: High-fidelity dashboard with spending trends, security scores, and risk analysis.

---

## 📂 Repository Structure

```text
root/
├── backend/            # FastAPI Backend & AI Logic
│   ├── app/            # Application Core
│   │   ├── db/         # Database Models & Config
│   │   ├── ml/         # Isolation Forest Engine
│   │   └── main.py     # API Endpoints & WebSockets
│   ├── requirements.txt
│   └── fraud_model.pkl # Trained AI Model
├── mobile/             # React Native (Expo) Frontend
│   ├── src/
│   │   ├── screens/    # 7 Premium UI Screens
│   │   ├── hooks/      # WebSocket Alert Listener
│   │   └── services/   # API & Auth Services
│   └── App.js
└── render.yaml         # Cloud Deployment Configuration
```

---

## 🛠️ Technology Stack

*   **Frontend**: React Native, Expo, Axios, WebSockets, Lucide Icons.
*   **Backend**: Python, FastAPI, SQLAlchemy (SQLite), Pydantic.
*   **AI/ML**: Scikit-Learn (Isolation Forest), Numpy, Pandas.
*   **DevOps**: Docker, Render.com (Auto-deployment).

---

## 🏁 Quick Start

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 2. Mobile App Setup
```bash
cd mobile
npm install
npx expo start
```

### 3. Demo Scenarios
To test the "WOW" factor, try triggering these anomalies:
*   **Location Anomaly**: Add a transaction from a different city.
*   **Amount Anomaly**: Add a transaction 5x higher than your usual average.
*   **Time Anomaly**: Add a transaction between 12 AM and 5 AM.

---

## 💎 Design Philosophy
NeuroShield prioritizes **Visual Excellence** and **User Experience**. The mobile app features a modern dark-mode aesthetic with glassmorphism, smooth animations, and intuitive interaction loops.

**Built with ❤️ for a safer financial future.**
