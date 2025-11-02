// src/screens/MyRegistrationsScreen.js

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Button, Alert } from 'react-native';
import { fetchEventsFromAPI } from '../utils/api';
import { getRegisteredEvents, removeRegisteredEvent } from '../utils/storage';
import { useTheme } from '../context/ThemeContext';
import { LIGHT_COLORS, DARK_COLORS } from '../constants/colors';

export default function MyRegistrationsScreen({ navigation }) {
  const { isDark } = useTheme();
  const COLORS = isDark ? DARK_COLORS : LIGHT_COLORS;
  
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [eventsData, registeredIds] = await Promise.all([
        fetchEventsFromAPI(),
        getRegisteredEvents()
      ]);
      setAllEvents(eventsData);
      const filteredEvents = eventsData.filter(event => registeredIds.includes(event.id));
      setRegisteredEvents(filteredEvents);
    } catch (error) {
      Alert.alert('Error', 'Failed to load events');
    }
  };

  const handleUnregister = async (eventId) => {
    try {
      await removeRegisteredEvent(eventId);
      const registeredIds = await getRegisteredEvents();
      const filteredEvents = allEvents.filter(event => registeredIds.includes(event.id));
      setRegisteredEvents(filteredEvents);
      Alert.alert('Success', 'You have successfully unregistered from the event.');
    } catch (e) {
      Alert.alert('Error', 'Failed to unregister from the event.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.item, { backgroundColor: COLORS.cardUnregistered, borderColor: COLORS.border }]}>
      <TouchableOpacity onPress={() => navigation.navigate('Details', { event: item })}>
        <Text style={[styles.name, { color: COLORS.textPrimary }]}>{item.name}</Text>
        <Text style={[styles.category, { color: COLORS.textSecondary }]}>{item.category}</Text>
        <Text style={[styles.date, { color: COLORS.textSecondary }]}>{item.date}</Text>
      </TouchableOpacity>
      <View style={styles.buttonWrapper}>
        <Button title="Unregister" color={COLORS.error} onPress={() => handleUnregister(item.id)} />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: COLORS.background }]}>
      <Text style={[styles.header, { color: COLORS.primary }]}>My Registered Events</Text>
      {registeredEvents.length === 0 ? (
        <Text style={[styles.emptyText, { color: COLORS.emptyText }]}>No registered events yet.</Text>
      ) : (
        <FlatList data={registeredEvents} keyExtractor={item => item.id} renderItem={renderItem} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 30, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  emptyText: { fontSize: 18, textAlign: 'center', fontStyle: 'italic', marginTop: 30 },
  item: { padding: 20, borderRadius: 15, borderWidth: 2, marginBottom: 15 },
  name: { fontSize: 24, fontWeight: 'bold' },
  category: { fontSize: 20, marginTop: 8 },
  date: { fontSize: 16, marginTop: 8, fontStyle: 'italic' },
  buttonWrapper: { marginTop: 10 },
});
