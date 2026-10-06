// The three polyfill lines are only needed because the app was tested
// with them in place. They are harmless.
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
    <SafeAreaProvider>
      <RecordsProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </RecordsProvider>
    </SafeAreaProvider>
  );
}