// src/utils/calendar.js

import * as Calendar from 'expo-calendar';
import { Alert, Platform } from 'react-native';

// Request calendar permissions
export const requestCalendarPermissions = async () => {
  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status === 'granted') {
      return true;
    } else {
      Alert.alert(
        'Permission Required',
        'Please grant calendar permissions to add events to your calendar.'
      );
      return false;
    }
  } catch (error) {
    console.error('Error requesting calendar permissions:', error);
    return false;
  }
};

// Get default calendar
export const getDefaultCalendar = async () => {
  try {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    
    // Try to find default calendar
    let defaultCalendar = calendars.find(
      cal => cal.isPrimary || cal.allowsModifications
    );
    
    // If no default, use first available
    if (!defaultCalendar && calendars.length > 0) {
      defaultCalendar = calendars[0];
    }
    
    return defaultCalendar;
  } catch (error) {
    console.error('Error getting calendar:', error);
    return null;
  }
};

// Add event to calendar
export const addEventToCalendar = async (eventDetails) => {
  try {
    // Request permissions
    const hasPermission = await requestCalendarPermissions();
    if (!hasPermission) {
      return { success: false, message: 'Permission denied' };
    }
    
    // Get default calendar
    const calendar = await getDefaultCalendar();
    if (!calendar) {
      Alert.alert('Error', 'No calendar found on your device');
      return { success: false, message: 'No calendar found' };
    }
    
    // Parse date (assuming format like "2025-03-15")
    const eventDate = new Date(eventDetails.date);
    
    // Create event
    const eventId = await Calendar.createEventAsync(calendar.id, {
      title: eventDetails.name,
      startDate: eventDate,
      endDate: new Date(eventDate.getTime() + 2 * 60 * 60 * 1000), // +2 hours
      location: eventDetails.location,
      notes: `${eventDetails.description}\n\nOrganizer: ${eventDetails.organizer}\nCategory: ${eventDetails.category}`,
      timeZone: 'Asia/Kolkata', // IST timezone
      alarms: [
        { relativeOffset: -60 }, // 1 hour before
        { relativeOffset: -1440 }, // 1 day before
      ],
    });
    
    return { 
      success: true, 
      message: 'Event added to calendar successfully!',
      eventId 
    };
    
  } catch (error) {
    console.error('Error adding event to calendar:', error);
    return { 
      success: false, 
      message: 'Failed to add event to calendar' 
    };
  }
};

// Format date for display
export const formatEventDate = (dateString) => {
  try {
    const date = new Date(dateString);
    const options = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
  } catch (error) {
    return dateString;
  }
};
