import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import BotanistLoginScreen from '../screens/BotanistLoginScreen';
import BotanistHomeScreen from '../screens/BotanistHomeScreen';
import VisitorHomeScreen from '../screens/VisitorHomeScreen';
import NewPlantRecordScreen from '../screens/NewPlantRecordScreen';
import PlantRecordSummaryScreen from '../screens/PlantRecordSummaryScreen';
import BotanistProfileScreen from '../screens/BotanistProfileScreen';
import { useTheme } from '../theme/ThemeContext';
import ScanQRScreen from '../screens/ScanQRScreen';
import ExploreScreen from '../screens/ExploreScreen';
import IotScreen from '../screens/IotScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { isDark, colors } = useTheme();

  // Keeps the screen background and the transitions in the current theme.
  const navigationTheme = {
    ...DefaultTheme,
    dark: isDark,
    colors: {
      ...DefaultTheme.colors,
      background: colors.bg,
      card: colors.surface,
      text: colors.textPrimary,
      border: colors.border,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName="VisitorHome"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="BotanistLogin" component={BotanistLoginScreen} />
        <Stack.Screen
          name="BotanistHome"
          component={BotanistHomeScreen}
          options={{ gestureEnabled: false, animationEnabled: false }}
        />
        <Stack.Screen
          name="VisitorHome"
          component={VisitorHomeScreen}
          options={{ gestureEnabled: false, animationEnabled: false }}
        />
        <Stack.Screen name="NewPlantRecord" component={NewPlantRecordScreen} />
        <Stack.Screen name="PlantRecordSummary" component={PlantRecordSummaryScreen} />
        <Stack.Screen name="BotanistProfile" component={BotanistProfileScreen} />
        <Stack.Screen
          name="ScanQR"
          component={ScanQRScreen}
          options={{ gestureEnabled: false, animationEnabled: false }}
        />
        <Stack.Screen
          name="Iot"
          component={IotScreen}
          options={{ gestureEnabled: false, animationEnabled: false }}
        />
        <Stack.Screen
          name="Explore"
          component={ExploreScreen}
          options={{ gestureEnabled: false, animationEnabled: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}