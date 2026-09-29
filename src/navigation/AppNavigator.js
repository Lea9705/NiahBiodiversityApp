import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import RoleSelectScreen from '../screens/RoleSelectScreen';
import BotanistLoginScreen from '../screens/BotanistLoginScreen';
import BotanistHomeScreen from '../screens/BotanistHomeScreen';
import VisitorHomeScreen from '../screens/VisitorHomeScreen';
import NewPlantRecordScreen from '../screens/NewPlantRecordScreen';
import PlantDetailScreen from '../screens/PlantDetailScreen';

import { colors } from '../theme/colors';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="RoleSelect"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
        <Stack.Screen name="BotanistLogin" component={BotanistLoginScreen} />
        <Stack.Screen name="BotanistHome" component={BotanistHomeScreen} />
        <Stack.Screen name="VisitorHome" component={VisitorHomeScreen} />
        <Stack.Screen name="NewPlantRecord" component={NewPlantRecordScreen} />
        <Stack.Screen name="PlantDetail" component={PlantDetailScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
