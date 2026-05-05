// 1. THIS MUST BE THE ABSOLUTE FIRST LINE OF THE ENTIRE PROJECT
if (typeof window !== 'undefined') {
  window.expo = window.expo || {};
  window.expo.registerWebModule = window.expo.registerWebModule || function() {
    console.log('Force-mocked registerWebModule');
  };
}

// 2. Now import everything else
import '@expo/metro-runtime';
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
