// The real app. App.js starts it safely (see App.js).
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import { RecordsProvider } from './context/RecordsContext';
import { UserProvider } from './context/UserContext';
import { ThemeProvider, useTheme } from './theme/ThemeContext';

// The clock and battery icons follow the light / dark mode.
function ThemedStatusBar() {
  const { isDark } = useTheme();

  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

export default function AppMain() {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <ThemeProvider>
          <RecordsProvider>
            <ThemedStatusBar />
            <AppNavigator />
          </RecordsProvider>
        </ThemeProvider>
      </UserProvider>
    </SafeAreaProvider>
  );
}