import '@expo/metro-runtime';
import { AppRegistry } from 'react-native';
import App from './App';

// Manually register and run the app for web
AppRegistry.registerComponent('main', () => App);
if (typeof window !== 'undefined') {
  AppRegistry.runApplication('main', {
    initialProps: {},
    rootTag: document.getElementById('root') || document.getElementById('main'),
  });
}
