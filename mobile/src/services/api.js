import axios from 'axios';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API URL for Production (Render)
const BASE_URL = 'https://neuroshield-api.onrender.com';
// const BASE_URL = 'http://localhost:8000'; // Uncomment for local development

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response Interceptor for Error Handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        await AsyncStorage.removeItem('@NeuroShield:authData');
        Alert.alert('Session Expired', 'Please login again.');
      }
    } else {
      Alert.alert('Network Error', 'Please check your internet connection.');
    }
    return Promise.reject(error);
  }
);

export const getTransactions = () => api.get('/transactions/');
export const createTransaction = (data) => api.post('/transactions/', data);
export const getAnalytics = () => api.get('/analytics');
export const provideFeedback = (data) => api.post('/transactions/feedback', data);

export default {
  getTransactions,
  createTransaction,
  getAnalytics,
  provideFeedback,
  sendFeedback: (transaction_id, feedback) => provideFeedback({ transaction_id, feedback })
};
