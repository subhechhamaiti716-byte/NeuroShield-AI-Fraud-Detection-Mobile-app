import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStorageData();
  }, []);

  async function loadStorageData() {
    try {
      const authDataSerialized = await AsyncStorage.getItem('@NeuroShield:authData');
      if (authDataSerialized) {
        const authData = JSON.parse(authDataSerialized);
        setUser(authData);
        api.defaults.headers.Authorization = `Bearer ${authData.token}`;
      }
    } catch (error) {
      console.log('Error loading auth data', error);
    } finally {
      setLoading(false);
    }
  }

  const login = async (email, password) => {
    try {
      const response = await api.post('/token', { email, password });
      const authData = { email, token: response.data.data.access_token };
      
      setUser(authData);
      api.defaults.headers.Authorization = `Bearer ${authData.token}`;
      
      await AsyncStorage.setItem('@NeuroShield:authData', JSON.stringify(authData));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Login failed' };
    }
  };

  const signup = async (email, password, fullName) => {
    try {
      await api.post('/signup', { email, password, full_name: fullName });
      return await login(email, password);
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Signup failed' };
    }
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('@NeuroShield:authData');
    setUser(null);
    delete api.defaults.headers.Authorization;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
