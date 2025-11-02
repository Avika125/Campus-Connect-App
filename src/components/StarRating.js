// src/components/StarRating.js

import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

const StarRating = ({ 
  rating = 0, 
  maxRating = 5, 
  size = 32, 
  onRatingChange = null,
  disabled = false,
  showNumber = true 
}) => {
  const handlePress = (selectedRating) => {
    if (!disabled && onRatingChange) {
      onRatingChange(selectedRating);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>
        {[...Array(maxRating)].map((_, index) => {
          const starNumber = index + 1;
          const isFilled = starNumber <= rating;
          
          return (
            <TouchableOpacity
              key={index}
              onPress={() => handlePress(starNumber)}
              disabled={disabled}
              activeOpacity={0.7}
              style={styles.starButton}
            >
              <MaterialIcons
                name={isFilled ? "star" : "star-border"}
                size={size}
                color={isFilled ? COLORS.starFilled : COLORS.starEmpty}
              />
            </TouchableOpacity>
          );
        })}
      </View>
      
      {showNumber && rating > 0 && (
        <Text style={styles.ratingText}>
          {rating.toFixed(1)} / {maxRating}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starButton: {
    padding: 2,
  },
  ratingText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.rating,
  },
});

export default StarRating;
