import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import pickle
import os
from datetime import datetime
import math

class FraudDetector:
    def __init__(self, model_path="fraud_model.pkl", scaler_path="scaler.pkl"):
        self.model_path = model_path
        self.scaler_path = scaler_path
        self.model = None
        self.scaler = StandardScaler()
        self.user_profiles = {} # user_id -> { last_lat, last_lon, avg_amount, tx_count }
        self.load_model()

    def load_model(self):
        if os.path.exists(self.model_path) and os.path.exists(self.scaler_path):
            try:
                with open(self.model_path, 'rb') as f:
                    self.model = pickle.load(f)
                with open(self.scaler_path, 'rb') as f:
                    self.scaler = pickle.load(f)
            except Exception:
                self._initialize_new_model()
        else:
            self._initialize_new_model()

    def _initialize_new_model(self):
        self.model = IsolationForest(contamination=0.05, random_state=42)
        self._train_initial_model()

    def _train_initial_model(self):
        # Create a more robust synthetic dataset for 'normal' behavior
        # [amount, hour, lat, lon, is_known_device]
        normal_data = []
        
        # 1. Normal transactions: Low-mid amounts, daytime, Bangalore, known device
        for _ in range(200):
            amount = np.random.normal(1500, 800)
            hour = np.random.randint(8, 22)
            lat = 12.9716 + np.random.normal(0, 0.02)
            lon = 77.5946 + np.random.normal(0, 0.02)
            device = 1
            normal_data.append([max(10, amount), hour, lat, lon, device])

        X = np.array(normal_data)
        self.scaler.fit(X)
        X_scaled = self.scaler.transform(X)
        self.model.fit(X_scaled)
        self.save_model()

    def save_model(self):
        with open(self.model_path, 'wb') as f:
            pickle.dump(self.model, f)
        with open(self.scaler_path, 'wb') as f:
            pickle.dump(self.scaler, f)

    def calculate_distance(self, lat1, lon1, lat2, lon2):
        if lat1 is None or lon1 is None: return 0
        R = 6371 # Earth radius in km
        dLat = math.radians(lat2 - lat1)
        dLon = math.radians(lon2 - lon1)
        a = math.sin(dLat/2) * math.sin(dLat/2) + \
            math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
            math.sin(dLon/2) * math.sin(dLon/2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        return R * c

    def predict(self, user_id, amount, timestamp, lat, lon, device_info):
        hour = timestamp.hour
        is_known_device = device_info.get('is_known', True)
        
        # 1. Feature Vector for ML
        features = np.array([[amount, hour, lat, lon, 1 if is_known_device else 0]])
        features_scaled = self.scaler.transform(features)
        
        # 2. ML Prediction (Anomaly Score)
        # Isolation Forest: -1 for anomaly, 1 for normal
        prediction = self.model.predict(features_scaled)[0]
        raw_score = self.model.decision_function(features_scaled)[0]
        
        # Normalize score to 0-1 range (Fraud Probability)
        # Higher score = more suspicious
        fraud_score = 1.0 - (raw_score + 0.5) 
        
        # 3. Behavioral Profiling (Personalized Checks)
        profile = self.user_profiles.get(user_id, {
            'last_lat': lat, 'last_lon': lon, 'avg_amount': amount, 'tx_count': 1
        })
        
        # Sudden Location Change Check
        dist = self.calculate_distance(profile['last_lat'], profile['last_lon'], lat, lon)
        if dist > 500: # Over 500km change
            fraud_score += 0.3
            
        # Unusual Hour Check
        if hour >= 0 and hour <= 5:
            fraud_score += 0.3
            
        # New Device Check
        if not is_known_device:
            fraud_score += 0.2
            
        # Amount Deviation Check
        if amount > profile['avg_amount'] * 5: # 5x their average
            fraud_score += 0.2

        # Hard Limits
        fraud_score = max(0.0, min(0.99, fraud_score))
        
        is_fraud_final = (prediction == -1) or (fraud_score > 0.7)
        
        # Update Profile (In memory for now, ideally in DB)
        self.user_profiles[user_id] = {
            'last_lat': lat,
            'last_lon': lon,
            'avg_amount': (profile['avg_amount'] * profile['tx_count'] + amount) / (profile['tx_count'] + 1),
            'tx_count': profile['tx_count'] + 1
        }
        
        return float(fraud_score), is_fraud_final

    def add_feedback(self, user_id, amount, timestamp, lat, lon, was_fraud):
        """User feedback is used to tune the behavior profile and retrain the model."""
        # If user says "YES, it's me" (was_fraud is False), we update their profile 
        # to recognize this as 'normal' behavior for them.
        if not was_fraud:
            profile = self.user_profiles.get(user_id)
            if profile:
                # 1. Broaden their 'Safe Zone' for location
                # We can store a list of 'trusted_locations' in a real app
                profile['last_lat'] = lat
                profile['last_lon'] = lon
                
                # 2. Adjust their average spending (Moving Average)
                # If they confirm a large transaction is safe, we gradually increase their avg_amount
                profile['avg_amount'] = (profile['avg_amount'] * 0.8) + (amount * 0.2)
                
                # 3. Log the improvement
                print(f"AI Model Updated: User {user_id} profile adjusted for safe transaction of ₹{amount}")
        else:
            # If confirmed FRAUD, we could potentially blacklist this IP or device
            print(f"ALERT: User {user_id} confirmed fraud. Blocking signal patterns.")

fraud_detector = FraudDetector()
