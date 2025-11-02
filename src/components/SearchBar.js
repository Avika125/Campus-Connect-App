// src/components/SearchBar.js

import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { LIGHT_COLORS, DARK_COLORS } from '../constants/colors';

export default function SearchBar({ value, onChangeText, placeholder }) {
  const { isDark } = useTheme();
  const COLORS = isDark ? DARK_COLORS : LIGHT_COLORS;

  return (
    <TextInput
      style={[
        styles.searchBar,
        {
          backgroundColor: COLORS.white,
          borderColor: COLORS.border,
          color: COLORS.textPrimary,
        },
      ]}
      placeholder={placeholder || "Search events..."}
      placeholderTextColor={COLORS.textSecondary}
      value={value}
      onChangeText={onChangeText}
    />
  );
}

const styles = StyleSheet.create({
  searchBar: {
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 2,
  },
});
