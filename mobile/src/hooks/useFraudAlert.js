import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Platform } from 'react-native';

export const useFraudAlert = (navigation) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) return;

    const wsUrl = `wss://neuroshield-api.onrender.com/ws/${user.token}`;
    // const wsUrl = `ws://localhost:8000/ws/${user.token}`;

    const ws = new WebSocket(wsUrl);

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'FRAUD_ALERT') {
        // Navigate to Alert screen when fraud is detected
        navigation.navigate('Alert', { transaction: data });
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected. Reconnecting...');
      // Simple reconnection logic could go here
    };

    setSocket(ws);

    return () => ws.close();
  }, [user]);

  return socket;
};
