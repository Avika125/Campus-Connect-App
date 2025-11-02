import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { LIGHT_COLORS, DARK_COLORS } from '../constants/colors';
import { getFavoriteEvents } from '../utils/storage';
import EventCard from '../components/EventsCard';
import { fetchEventsFromAPI } from '../utils/api';

export default function MyFavoritesScreen({ navigation }) {
  const { isDark } = useTheme();
  const COLORS = isDark ? DARK_COLORS : LIGHT_COLORS;

  const [favoriteEventIds, setFavoriteEventIds] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const favIds = await getFavoriteEvents();
      const allEvents = await fetchEventsFromAPI();
      const favEvents = allEvents.filter(event => favIds.includes(event.id));
      setFavoriteEventIds(favIds);
      setEvents(favEvents);
    } catch (error) {
      console.error('Error loading favorite events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePress = (event) => {
    navigation.navigate('Details', { event });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: COLORS.background }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (events.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: COLORS.textSecondary, fontSize: 18 }}>You have no favorite events yet.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: COLORS.background }]}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EventCard 
            event={item} 
            isRegistered={false} 
            onPress={() => handlePress(item)} 
          />
        )}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
