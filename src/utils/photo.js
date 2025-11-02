// src/utils/photos.js

import AsyncStorage from '@react-native-async-storage/async-storage';

const PHOTOS_KEY = '@campus_connect_photos';

// Get all photos
export const getAllPhotos = async () => {
  try {
    const photosJson = await AsyncStorage.getItem(PHOTOS_KEY);
    return photosJson ? JSON.parse(photosJson) : {};
  } catch (error) {
    console.error('Error getting photos:', error);
    return {};
  }
};

// Get photos for specific event
export const getEventPhotos = async (eventId) => {
  try {
    const photos = await getAllPhotos();
    return photos[eventId] || [];
  } catch (error) {
    console.error('Error getting event photos:', error);
    return [];
  }
};

// Add photo for event
export const addEventPhoto = async (eventId, photoUri) => {
  try {
    const photos = await getAllPhotos();
    if (!photos[eventId]) {
      photos[eventId] = [];
    }
    
    const newPhoto = {
      id: Date.now().toString(),
      uri: photoUri,
      uploadedBy: 'You',
      date: new Date().toISOString(),
    };
    
    photos[eventId].push(newPhoto);
    await AsyncStorage.setItem(PHOTOS_KEY, JSON.stringify(photos));
    return true;
  } catch (error) {
    console.error('Error adding photo:', error);
    return false;
  }
};

// Delete photo
export const deleteEventPhoto = async (eventId, photoId) => {
  try {
    const photos = await getAllPhotos();
    if (photos[eventId]) {
      photos[eventId] = photos[eventId].filter(photo => photo.id !== photoId);
      await AsyncStorage.setItem(PHOTOS_KEY, JSON.stringify(photos));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting photo:', error);
    return false;
  }
};
