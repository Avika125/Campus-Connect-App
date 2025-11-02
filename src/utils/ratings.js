// src/utils/ratings.js

import AsyncStorage from '@react-native-async-storage/async-storage';

const RATINGS_KEY = '@campus_connect_ratings';
const REVIEWS_KEY = '@campus_connect_reviews';

// Get all ratings
export const getAllRatings = async () => {
  try {
    const ratingsJson = await AsyncStorage.getItem(RATINGS_KEY);
    return ratingsJson ? JSON.parse(ratingsJson) : {};
  } catch (error) {
    console.error('Error getting ratings:', error);
    return {};
  }
};

// Get rating for specific event
export const getEventRating = async (eventId) => {
  try {
    const ratings = await getAllRatings();
    return ratings[eventId] || null;
  } catch (error) {
    console.error('Error getting event rating:', error);
    return null;
  }
};

// Save rating for event
export const saveEventRating = async (eventId, rating) => {
  try {
    const ratings = await getAllRatings();
    ratings[eventId] = rating;
    await AsyncStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
    return true;
  } catch (error) {
    console.error('Error saving rating:', error);
    return false;
  }
};

// Get all reviews
export const getAllReviews = async () => {
  try {
    const reviewsJson = await AsyncStorage.getItem(REVIEWS_KEY);
    return reviewsJson ? JSON.parse(reviewsJson) : {};
  } catch (error) {
    console.error('Error getting reviews:', error);
    return {};
  }
};

// Get reviews for specific event
export const getEventReviews = async (eventId) => {
  try {
    const reviews = await getAllReviews();
    return reviews[eventId] || [];
  } catch (error) {
    console.error('Error getting event reviews:', error);
    return [];
  }
};

// Add review for event
export const addEventReview = async (eventId, review) => {
  try {
    const reviews = await getAllReviews();
    if (!reviews[eventId]) {
      reviews[eventId] = [];
    }
    
    const newReview = {
      id: Date.now().toString(),
      text: review.text,
      rating: review.rating,
      userName: review.userName || 'Anonymous',
      date: new Date().toISOString(),
    };
    
    reviews[eventId].push(newReview);
    await AsyncStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
    return true;
  } catch (error) {
    console.error('Error adding review:', error);
    return false;
  }
};

// Calculate average rating for event
export const calculateAverageRating = (reviews) => {
  if (!reviews || reviews.length === 0) return 0;
  
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return (sum / reviews.length).toFixed(1);
};
