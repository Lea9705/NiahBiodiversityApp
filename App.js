import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { RecordsProvider } from './src/context/RecordsContext';
import { UserProvider } from './src/context/UserContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <RecordsProvider>
          <StatusBar style="dark" />
          <AppNavigator />
        </RecordsProvider>
      </UserProvider>
    </SafeAreaProvider>
  );
}