import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import 'web-streams-polyfill/dist/polyfill';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { RecordsProvider } from './src/context/RecordsContext';

export default function App() {
  return (
    <RecordsProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </RecordsProvider>
  );
}