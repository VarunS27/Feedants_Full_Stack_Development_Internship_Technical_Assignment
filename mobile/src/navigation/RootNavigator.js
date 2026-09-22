import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CompetitionDetailsScreen } from '../screens/CompetitionDetailsScreen';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CompetitionDetails" component={CompetitionDetailsScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);
