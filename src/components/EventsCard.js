// src/components/EventsCard.js

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { LIGHT_COLORS, DARK_COLORS } from '../constants/colors';
import { getFavoriteEvents, toggleFavoriteEvent } from '../utils/storage';

export default function EventCard({ event, isRegistered, onPress }) {
  const { isDark } = useTheme();
  const COLORS = isDark ? DARK_COLORS : LIGHT_COLORS;

  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    // Load favorite status when component mounts
    loadFavoriteStatus();
  }, [event.id]);

  const loadFavoriteStatus = async () => {
    const favorites = await getFavoriteEvents();
    setIsFavorited(favorites.includes(event.id));
  };

  const handleToggleFavorite = async (e) => {
    // Stop propagation so card doesn't open when heart is clicked
    e.stopPropagation();
    
    const newStatus = await toggleFavoriteEvent(event.id);
    setIsFavorited(newStatus);
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: isRegistered ? COLORS.cardRegistered : COLORS.cardUnregistered,
          borderColor: COLORS.cardBorder,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={[styles.name, { color: COLORS.textPrimary }]}>{event.name}</Text>
        
        <TouchableOpacity
          onPress={handleToggleFavorite}
          activeOpacity={0.6}
          style={styles.favoriteButton}
        >
          <MaterialIcons
            name={isFavorited ? 'favorite' : 'favorite-border'}
            size={28}
            color={isFavorited ? '#e91e63' : COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <Text style={[styles.category, { color: COLORS.textSecondary }]}>{event.category}</Text>
      <Text style={[styles.date, { color: COLORS.textSecondary }]}>{event.date}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    marginBottom: 15,
    borderRadius: 15,
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: { 
    fontSize: 24, 
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  favoriteButton: {
    padding: 4,
  },
  category: { 
    fontSize: 20, 
    marginTop: 8 
  },
  date: { 
    fontSize: 16, 
    marginTop: 8, 
    fontStyle: 'italic' 
  },
});
