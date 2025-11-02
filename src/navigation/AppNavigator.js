import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import EventDetailsScreen from '../screens/EventDetailsScreen';
import MyRegistrationsScreen from '../screens/MyRegistrationsScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Campus Events' }}
        />
        <Stack.Screen 
          name="Details" 
          component={EventDetailsScreen} 
          options={{ title: 'Event Details' }}
        />
        <Stack.Screen 
          name="MyRegistrations" 
          component={MyRegistrationsScreen} 
          options={{ title: 'My Registrations' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
