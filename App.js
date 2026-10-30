import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { RecordsProvider } from './src/context/RecordsContext';
import { UserProvider } from './src/context/UserContext';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

// The clock and battery icons follow the light / dark mode.
function ThemedStatusBar() {
  const { isDark } = useTheme();

  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

export default function App() {
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