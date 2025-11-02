// src/screens/HomeScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { fetchEventsFromAPI } from '../utils/api';
import { getRegisteredEvents } from '../utils/storage';
import EventCard from '../components/EventsCard';
import SearchBar from '../components/SearchBar';
import { LIGHT_COLORS, DARK_COLORS } from '../constants/colors';
import LanguageSelector from '../components/LanguageSelector';
import { translate } from '../utils/i18n';
import { useTheme } from '../context/ThemeContext';

export default function HomeScreen({ navigation }) {
  const { isDark, toggleTheme } = useTheme();
  const COLORS = isDark ? DARK_COLORS : LIGHT_COLORS;
  
  const [events, setEvents] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [registeredEventIds, setRegisteredEventIds] = useState([]);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [eventsData, registeredIds] = await Promise.all([
        fetchEventsFromAPI(),
        getRegisteredEvents()
      ]);
      setEvents(eventsData);
      setFilteredEvents(eventsData);
      setRegisteredEventIds(registeredIds);
    } catch (error) {
      Alert.alert('Error', 'Failed to load events');
    }
  };

  const filterEvents = (text) => {
    setSearchText(text);
    const filtered = events.filter(
      (event) =>
        event.name.toLowerCase().includes(text.toLowerCase()) ||
        event.category.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredEvents(filtered);
  };

  const goToFavorites = () => {
    navigation.navigate('MyFavorites');
  };

  const renderItem = ({ item }) => (
    <EventCard
      event={item}
      isRegistered={registeredEventIds.includes(item.id)}
      onPress={() => navigation.navigate('Details', { event: item })}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: COLORS.background }]}>
      <View style={styles.content}>
        <Text style={[styles.header, { color: COLORS.primary }]}>🌈 Campus Events</Text>
        
        <SearchBar
          value={searchText}
          onChangeText={filterEvents}
          placeholder={translate('searchPlaceholder')}
        />
        
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Bottom button - better positioned */}
      <View style={[styles.bottomButtonContainer, { backgroundColor: COLORS.background, borderTopColor: COLORS.border }]}>
        <TouchableOpacity 
          style={[styles.myRegistrationsButton, { backgroundColor: COLORS.primary }]}
          onPress={() => navigation.navigate('MyRegistrations')}
          activeOpacity={0.8}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonIcon}>📋</Text>
            <Text style={[styles.buttonText, { color: COLORS.white }]}>{translate('myRegistrations')}</Text>
            {registeredEventIds.length > 0 && (
              <View style={styles.badge}>
                <Text style={[styles.badgeText, { color: COLORS.white }]}>{registeredEventIds.length}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Favorites Floating Button */}
      <TouchableOpacity
        style={[styles.favoritesButton, { backgroundColor: '#e91e63' }]}
        onPress={goToFavorites}
        activeOpacity={0.8}
      >
        <MaterialIcons name="favorite" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Theme Toggle Button - Floating */}
      <TouchableOpacity
        style={[styles.themeButton, { backgroundColor: isDark ? '#FFA726' : '#1976D2' }]}
        onPress={toggleTheme}
        activeOpacity={0.8}
      >
        <Text style={styles.themeButtonIcon}>{isDark ? '☀️' : '🌙'}</Text>
      </TouchableOpacity>

      {/* Language Selector Button - Floating */}
      <TouchableOpacity
        style={[styles.languageButton, { backgroundColor: COLORS.language }]}
        onPress={() => setLanguageModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.languageButtonIcon}>🌐</Text>
      </TouchableOpacity>

      {/* Language Selector Modal */}
      <LanguageSelector
        visible={languageModalVisible}
        onClose={() => setLanguageModalVisible(false)}
        onLanguageChange={(lang) => {
          setCurrentLanguage(lang);
          // Force re-render to update translations
          setSearchText('');
          filterEvents('');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  content: {
    flex: 1,
  },
  header: { 
    fontSize: 30, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginTop: 20,
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  bottomButtonContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    borderTopWidth: 1,
  },
  myRegistrationsButton: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: 'bold',
    flex: 1,
  },
  badge: {
    backgroundColor: '#ff6b6b',
    borderRadius: 10,
    minWidth: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  // FAVORITES BUTTON STYLES
  favoritesButton: {
    position: 'absolute',
    bottom: 230,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 999,
  },
  // THEME TOGGLE BUTTON STYLES
  themeButton: {
    position: 'absolute',
    bottom: 160,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 999,
  },
  themeButtonIcon: {
    fontSize: 28,
  },
  // LANGUAGE BUTTON STYLES
  languageButton: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 999,
  },
  languageButtonIcon: {
    fontSize: 28,
  },
});
