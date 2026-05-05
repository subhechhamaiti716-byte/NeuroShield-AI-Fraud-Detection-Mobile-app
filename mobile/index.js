import '@expo/metro-runtime';
import { registerRootComponent } from 'expo';
import App from './App';

// CRITICAL FIX: Mock the missing function that is causing the blank screen
if (typeof window !== 'undefined') {
  window.expo = window.expo || {};
  if (!window.expo.registerWebModule) {
    window.expo.registerWebModule = () => {
      console.log('Mocked registerWebModule to prevent crash');
    };
  }
}

registerRootComponent(App);
