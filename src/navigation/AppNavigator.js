import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import RoleSelectScreen from '../screens/RoleSelectScreen';
import BotanistLoginScreen from '../screens/BotanistLoginScreen';
import BotanistHomeScreen from '../screens/BotanistHomeScreen';
import VisitorHomeScreen from '../screens/VisitorHomeScreen';
import VisitorExploreScreen from '../screens/VisitorExploreScreen';
import VisitorMapScreen from '../screens/VisitorMapScreen';
import NewPlantRecordScreen from '../screens/NewPlantRecordScreen';
import PlantRecordSummaryScreen from '../screens/PlantRecordSummaryScreen';
import PlantDetailScreen from '../screens/PlantDetailScreen';
import BotanistProfileScreen from '../screens/BotanistProfileScreen';
import { colors } from '../theme/colors';
import ScanQRScreen from '../screens/ScanQRScreen';
import ActivitiesScreen from '../screens/ActivitiesScreen';
import ExploreScreen from '../screens/ExploreScreen';

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
        <Stack.Screen
          name="BotanistHome"
          component={BotanistHomeScreen}
          options={{ gestureEnabled: false, animationEnabled: false }}
        />
        <Stack.Screen name="VisitorHome" component={VisitorHomeScreen} />
        <Stack.Screen name="VisitorExplore" component={VisitorExploreScreen} />
        <Stack.Screen name="VisitorMap" component={VisitorMapScreen} />
        <Stack.Screen name="NewPlantRecord" component={NewPlantRecordScreen} />
        <Stack.Screen name="PlantRecordSummary" component={PlantRecordSummaryScreen} />
        <Stack.Screen name="PlantDetail" component={PlantDetailScreen} />
        <Stack.Screen name="BotanistProfile" component={BotanistProfileScreen} />
        <Stack.Screen
          name="ScanQR"
          component={ScanQRScreen}
          options={({ route }) => {
            const visitor = route.params?.mode === 'visitor';
            return { gestureEnabled: visitor, animationEnabled: visitor };
          }}
        />
        <Stack.Screen name="Activities" component={ActivitiesScreen} />
        <Stack.Screen
          name="Explore"
          component={ExploreScreen}
          options={{ gestureEnabled: false, animationEnabled: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}