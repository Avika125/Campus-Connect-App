// App.js

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import EventDetailsScreen from './src/screens/EventDetailsScreen';
import MyRegistrationsScreen from './src/screens/MyRegistrationsScreen';
import MyFavoritesScreen from './src/screens/MyFavoritesScreen';
import EventChatScreen from './src/screens/EventChatScreen';
import { ThemeProvider } from './src/context/ThemeContext';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#006064',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
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
          name="EventChat" 
          component={EventChatScreen} 
          options={{ title: 'Event Chat' }} 
        />
        <Stack.Screen 
          name="MyRegistrations" 
          component={MyRegistrationsScreen} 
          options={{ title: 'My Registrations' }} 
        />
        <Stack.Screen 
          name="MyFavorites" 
          component={MyFavoritesScreen} 
          options={{ title: 'My Favorites' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}
