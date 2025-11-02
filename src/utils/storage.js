// src/utils/storage.js

import AsyncStorage from '@react-native-async-storage/async-storage';

const REGISTERED_EVENTS_KEY = 'registeredEvents';
const FAVORITES_KEY = '@favorite_events';

// ========== REGISTERED EVENTS MANAGEMENT ==========

export const getRegisteredEvents = async () => {
  try {
    const registeredEvents = await AsyncStorage.getItem(REGISTERED_EVENTS_KEY);
    return registeredEvents ? JSON.parse(registeredEvents) : [];
  } catch (error) {
    console.error('Failed to load registered events', error);
    return [];
  }
};

export const saveRegisteredEvent = async (eventId) => {
  try {
    const registeredEvents = await getRegisteredEvents();
    if (!registeredEvents.includes(eventId)) {
      registeredEvents.push(eventId);
      await AsyncStorage.setItem(REGISTERED_EVENTS_KEY, JSON.stringify(registeredEvents));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to save registration', error);
    throw error;
  }
};

export const removeRegisteredEvent = async (eventId) => {
  try {
    const registeredEvents = await getRegisteredEvents();
    const updatedEvents = registeredEvents.filter(id => id !== eventId);
    await AsyncStorage.setItem(REGISTERED_EVENTS_KEY, JSON.stringify(updatedEvents));
    return true;
  } catch (error) {
    console.error('Failed to remove registration', error);
    throw error;
  }
};

// ========== FAVORITES MANAGEMENT ==========

// Get all favorite event IDs
export const getFavoriteEvents = async () => {
  try {
    const favorites = await AsyncStorage.getItem(FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Error loading favorites:', error);
    return [];
  }
};

// Add event to favorites
export const addFavoriteEvent = async (eventId) => {
  try {
    const favorites = await getFavoriteEvents();
    if (!favorites.includes(eventId)) {
      favorites.push(eventId);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error adding favorite:', error);
    return false;
  }
};

// Remove event from favorites
export const removeFavoriteEvent = async (eventId) => {
  try {
    const favorites = await getFavoriteEvents();
    const updated = favorites.filter(id => id !== eventId);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Error removing favorite:', error);
    return false;
  }
};

// Toggle favorite status (add if not favorited, remove if favorited)
export const toggleFavoriteEvent = async (eventId) => {
  try {
    const favorites = await getFavoriteEvents();
    const isFavorited = favorites.includes(eventId);
    
    if (isFavorited) {
      await removeFavoriteEvent(eventId);
      return false; // Removed from favorites
    } else {
      await addFavoriteEvent(eventId);
      return true; // Added to favorites
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return false;
  }
};

// Check if event is favorited
export const isEventFavorited = async (eventId) => {
  try {
    const favorites = await getFavoriteEvents();
    return favorites.includes(eventId);
  } catch (error) {
    console.error('Error checking favorite:', error);
    return false;
  }
};
