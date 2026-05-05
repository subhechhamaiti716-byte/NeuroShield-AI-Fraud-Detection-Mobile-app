import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AuthNavigator from './src/navigation/AuthNavigator';
import MainNavigator from './src/navigation/MainNavigator';

function Navigation() {
  const { user, loading } = useAuth();

  console.log('App Navigation: loading=', loading, 'user=', !!user);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0A0F', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00D2FF" />
        <Text style={{ color: '#FFFFFF', marginTop: 10 }}>Shielding your assets...</Text>
      </View>
    );
  }

  try {
    return (
      <NavigationContainer>
        {user ? <MainNavigator /> : <AuthNavigator />}
      </NavigationContainer>
    );
  } catch (err) {
    console.error('Navigation Error:', err);
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0A0F', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: '#FF4B4B', fontSize: 18, fontWeight: 'bold' }}>Navigation Error</Text>
        <Text style={{ color: '#FFFFFF', marginTop: 10, textAlign: 'center' }}>{err.message}</Text>
      </View>
    );
  }
}

export default function App() {
  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}
