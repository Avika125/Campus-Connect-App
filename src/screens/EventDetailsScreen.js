// src/screens/EventDetailsScreen.js

import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  ActivityIndicator, 
  Share,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Image
} from 'react-native';
import { getRegisteredEvents, saveRegisteredEvent, removeRegisteredEvent } from '../utils/storage';
import { addEventToCalendar, formatEventDate } from '../utils/calendar';
import { MaterialIcons } from '@expo/vector-icons';
import { translate } from '../utils/i18n';
import StarRating from '../components/StarRating';
import { 
  getEventReviews, 
  addEventReview, 
  calculateAverageRating,
  saveEventRating,
  getEventRating 
} from '../utils/ratings';
import * as ImagePicker from 'expo-image-picker';
import { getEventPhotos, addEventPhoto, deleteEventPhoto } from '../utils/photo';
import { useTheme } from '../context/ThemeContext';
import { LIGHT_COLORS, DARK_COLORS } from '../constants/colors';
import { useNavigation } from '@react-navigation/native';


export default function EventDetailsScreen({ route }) {
  const { event } = route.params;
  const { isDark } = useTheme();
  const COLORS = isDark ? DARK_COLORS : LIGHT_COLORS;
  const navigation = useNavigation();
  
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addingToCalendar, setAddingToCalendar] = useState(false);
  
  // Ratings & Reviews states
  const [userRating, setUserRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [tempRating, setTempRating] = useState(0);
  
  // Photo Gallery states
  const [photos, setPhotos] = useState([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [tempPhotoUri, setTempPhotoUri] = useState(null);


  useEffect(() => {
    checkRegistration();
    loadReviews();
    loadPhotos();
  }, []);


  const checkRegistration = async () => {
    setLoading(true);
    try {
      const registeredEvents = await getRegisteredEvents();
      setRegistered(registeredEvents.includes(event.id));
    } catch (e) {
      Alert.alert('Error', 'Failed to load registration status.');
    } finally {
      setLoading(false);
    }
  };


  const loadReviews = async () => {
    try {
      const eventReviews = await getEventReviews(event.id);
      setReviews(eventReviews);
      
      if (eventReviews.length > 0) {
        const avg = calculateAverageRating(eventReviews);
        setAverageRating(parseFloat(avg));
      }
      
      // Load user's rating
      const savedRating = await getEventRating(event.id);
      if (savedRating) {
        setUserRating(savedRating);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };


  const loadPhotos = async () => {
    try {
      const eventPhotos = await getEventPhotos(event.id);
      setPhotos(eventPhotos);
    } catch (error) {
      console.error('Error loading photos:', error);
    }
  };


  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is required to take photos.');
      return false;
    }
    return true;
  };


  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Gallery permission is required to select photos.');
      return false;
    }
    return true;
  };


  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;
    
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    
    if (!result.canceled) {
      await uploadPhoto(result.assets[0].uri);
    }
  };


  const handlePickPhoto = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    
    if (!result.canceled) {
      await uploadPhoto(result.assets[0].uri);
    }
  };


  const uploadPhoto = async (uri) => {
    // Don't upload immediately - just store temporarily for preview
    setTempPhotoUri(uri);
    setUploadingPhoto(false);
  };


  const confirmUploadPhoto = async () => {
    if (!tempPhotoUri) return;
    
    setUploadingPhoto(true);
    const success = await addEventPhoto(event.id, tempPhotoUri);
    setUploadingPhoto(false);
    
    if (success) {
      Alert.alert('Success', 'Photo uploaded successfully!');
      setTempPhotoUri(null);
      loadPhotos(); // Reload photos
    } else {
      Alert.alert('Error', 'Failed to upload photo');
    }
  };


  const cancelUploadPhoto = () => {
    setTempPhotoUri(null);
  };


  const handleDeletePhoto = (photoId) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteEventPhoto(event.id, photoId);
            if (success) {
              Alert.alert('Success', 'Photo deleted');
              loadPhotos();
            }
          }
        }
      ]
    );
  };


  const showPhotoOptions = () => {
    Alert.alert(
      translate('uploadPhoto'),
      'Choose an option',
      [
        { text: translate('takePhoto'), onPress: handleTakePhoto },
        { text: translate('selectFromGallery'), onPress: handlePickPhoto },
        { text: translate('cancel'), style: 'cancel' }
      ]
    );
  };


  const handleRatingChange = async (rating) => {
    setUserRating(rating);
    await saveEventRating(event.id, rating);
    
    // Ask if they want to leave a review
    Alert.alert(
      'Thank you!',
      'Would you like to write a review?',
      [
        { text: 'Later', style: 'cancel' },
        { 
          text: 'Write Review', 
          onPress: () => {
            setTempRating(rating);
            setReviewModalVisible(true);
          }
        }
      ]
    );
  };


  const handleSubmitReview = async () => {
    if (!reviewText.trim()) {
      Alert.alert('Error', 'Please write a review');
      return;
    }
    
    if (tempRating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }
    
    const success = await addEventReview(event.id, {
      text: reviewText,
      rating: tempRating,
      userName: 'You',
    });
    
    if (success) {
      Alert.alert('Success', 'Review submitted successfully!');
      setReviewModalVisible(false);
      setReviewText('');
      setTempRating(0);
      loadReviews(); // Reload reviews
    } else {
      Alert.alert('Error', 'Failed to submit review');
    }
  };


  const handleRegister = async () => {
    setLoading(true);
    try {
      const success = await saveRegisteredEvent(event.id);
      if (success) {
        setRegistered(true);
        Alert.alert('Success', 'You have successfully registered for this event!');
      } else {
        Alert.alert('Already Registered', 'You are already registered for this event.');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to save registration.');
    } finally {
      setLoading(false);
    }
  };


  const handleUnregister = async () => {
    setLoading(true);
    try {
      await removeRegisteredEvent(event.id);
      setRegistered(false);
      Alert.alert('Success', 'You have successfully unregistered from this event!');
    } catch (e) {
      Alert.alert('Error', 'Failed to unregister.');
    } finally {
      setLoading(false);
    }
  };


  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this event!\n\n📌 ${event.name}\n📝 ${event.description}\n📅 ${event.date}\n📍 ${event.location}\n👤 Organizer: ${event.organizer}`,
        title: 'Share Event Details',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share the event.');
    }
  };


  const handleAddToCalendar = async () => {
    setAddingToCalendar(true);
    
    const result = await addEventToCalendar({
      name: event.name,
      date: event.date,
      location: event.location,
      description: event.description,
      organizer: event.organizer,
      category: event.category,
    });
    
    setAddingToCalendar(false);
    
    if (result.success) {
      Alert.alert(
        '✅ Success!',
        `Event added to your calendar!\n\n${formatEventDate(event.date)}\n\nYou'll get reminders 1 day and 1 hour before the event.`
      );
    } else {
      Alert.alert('Error', result.message);
    }
  };


  const openEventChat = () => {
    navigation.navigate('EventChat');
  };


  if (loading && !registered && userRating === 0 && photos.length === 0) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: COLORS.background }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }


  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: COLORS.background }]} 
      contentContainerStyle={styles.contentContainer}
    >
      {/* Event Header */}
      <View style={styles.header}>
        <Text style={[styles.name, { color: COLORS.primary }]}>{event.name}</Text>
        <View style={[styles.categoryBadge, { backgroundColor: COLORS.secondary }]}>
          <Text style={[styles.categoryText, { color: COLORS.textPrimary }]}>{event.category}</Text>
        </View>
      </View>

      {/* Event Details Card */}
      <View style={[styles.detailsCard, { backgroundColor: COLORS.white, borderColor: COLORS.cardBorder }]}>
        <View style={styles.detailRow}>
          <MaterialIcons name="date-range" size={24} color={COLORS.primary} />
          <View style={styles.detailContent}>
            <Text style={[styles.label, { color: COLORS.textSecondary }]}>Date</Text>
            <Text style={[styles.detail, { color: COLORS.textPrimary }]}>{event.date}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <MaterialIcons name="location-on" size={24} color={COLORS.primary} />
          <View style={styles.detailContent}>
            <Text style={[styles.label, { color: COLORS.textSecondary }]}>Location</Text>
            <Text style={[styles.detail, { color: COLORS.textPrimary }]}>{event.location}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <MaterialIcons name="person" size={24} color={COLORS.primary} />
          <View style={styles.detailContent}>
            <Text style={[styles.label, { color: COLORS.textSecondary }]}>Organizer</Text>
            <Text style={[styles.detail, { color: COLORS.textPrimary }]}>{event.organizer}</Text>
          </View>
        </View>

        <View style={[styles.descriptionSection, { borderTopColor: COLORS.border }]}>
          <Text style={[styles.descriptionLabel, { color: COLORS.textPrimary }]}>Description</Text>
          <Text style={[styles.descriptionText, { color: COLORS.textSecondary }]}>{event.description}</Text>
        </View>
      </View>

      {/* Ratings & Reviews Section */}
      <View style={[styles.ratingsSection, { backgroundColor: COLORS.white, borderColor: COLORS.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>⭐ Rate This Event</Text>
        
        {averageRating > 0 && (
          <View style={[styles.averageRatingContainer, { backgroundColor: COLORS.ratingLight }]}>
            <Text style={[styles.averageRatingText, { color: COLORS.rating }]}>{averageRating}</Text>
            <Text style={[styles.averageRatingLabel, { color: COLORS.textSecondary }]}>Average Rating</Text>
            <Text style={[styles.reviewCount, { color: COLORS.textSecondary }]}>
              ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
            </Text>
          </View>
        )}
        
        <StarRating
          rating={userRating}
          onRatingChange={handleRatingChange}
          size={40}
          showNumber={false}
        />
        
        {userRating > 0 && (
          <Text style={[styles.userRatingText, { color: COLORS.rating }]}>
            Your rating: {userRating} stars
          </Text>
        )}
        
        <TouchableOpacity
          style={[styles.writeReviewButton, { backgroundColor: COLORS.rating }]}
          onPress={() => {
            setTempRating(userRating || 0);
            setReviewModalVisible(true);
          }}
          activeOpacity={0.8}
        >
          <MaterialIcons name="rate-review" size={20} color={COLORS.white} />
          <Text style={styles.writeReviewText}>{translate('writeReview')}</Text>
        </TouchableOpacity>
        
        {/* Reviews List */}
        {reviews.length > 0 && (
          <View style={[styles.reviewsList, { borderTopColor: COLORS.border }]}>
            <Text style={[styles.reviewsTitle, { color: COLORS.textPrimary }]}>
              {translate('reviews')} ({reviews.length})
            </Text>
            
            {reviews.slice(0, 3).map((review) => (
              <View key={review.id} style={[styles.reviewItem, { backgroundColor: COLORS.background }]}>
                <View style={styles.reviewHeader}>
                  <Text style={[styles.reviewAuthor, { color: COLORS.textPrimary }]}>{review.userName}</Text>
                  <StarRating
                    rating={review.rating}
                    size={16}
                    disabled={true}
                    showNumber={false}
                  />
                </View>
                <Text style={[styles.reviewText, { color: COLORS.textSecondary }]}>{review.text}</Text>
                <Text style={[styles.reviewDate, { color: COLORS.textSecondary }]}>
                  {new Date(review.date).toLocaleDateString()}
                </Text>
              </View>
            ))}
            
            {reviews.length > 3 && (
              <Text style={[styles.moreReviews, { color: COLORS.primary }]}>
                +{reviews.length - 3} more reviews
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Photo Gallery Section */}
      <View style={[styles.gallerySection, { backgroundColor: COLORS.white, borderColor: COLORS.cardBorder }]}>
        <View style={styles.gallerySectionHeader}>
          <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>📸 {translate('photoGallery')}</Text>
          <TouchableOpacity
            style={[styles.uploadPhotoButton, { backgroundColor: COLORS.gallery }]}
            onPress={showPhotoOptions}
            disabled={uploadingPhoto || tempPhotoUri !== null}
            activeOpacity={0.8}
          >
            <MaterialIcons name="add-a-photo" size={20} color={COLORS.white} />
            <Text style={styles.uploadPhotoText}>
              {translate('uploadPhoto')}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Photo Preview with Done/Cancel */}
        {tempPhotoUri && (
          <View style={styles.photoPreviewContainer}>
            <Text style={[styles.photoPreviewTitle, { color: COLORS.textPrimary }]}>Preview Your Photo</Text>
            <Image source={{ uri: tempPhotoUri }} style={styles.photoPreview} />
            <View style={styles.photoPreviewButtons}>
              <TouchableOpacity
                style={[styles.photoPreviewButton, styles.cancelPreviewButton, { backgroundColor: COLORS.background, borderColor: COLORS.error }]}
                onPress={cancelUploadPhoto}
                activeOpacity={0.8}
              >
                <MaterialIcons name="close" size={20} color={COLORS.error} />
                <Text style={[styles.cancelPreviewText, { color: COLORS.error }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.photoPreviewButton, styles.donePreviewButton, { backgroundColor: COLORS.gallery }]}
                onPress={confirmUploadPhoto}
                disabled={uploadingPhoto}
                activeOpacity={0.8}
              >
                <MaterialIcons name="check" size={20} color={COLORS.white} />
                <Text style={styles.donePreviewText}>
                  {uploadingPhoto ? 'Uploading...' : 'Done'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {photos.length === 0 && !tempPhotoUri ? (
          <View style={styles.noPhotosContainer}>
            <MaterialIcons name="photo-library" size={60} color={COLORS.galleryLight} />
            <Text style={[styles.noPhotosText, { color: COLORS.textSecondary }]}>{translate('noPhotos')}</Text>
            <Text style={[styles.noPhotosSubText, { color: COLORS.textSecondary }]}>Be the first to add photos!</Text>
          </View>
        ) : (
          !tempPhotoUri && (
            <View style={styles.photosGrid}>
              {photos.map((photo) => (
                <View key={photo.id} style={styles.photoCard}>
                  <Image source={{ uri: photo.uri }} style={styles.photoImage} />
                  <View style={styles.photoOverlay}>
                    <Text style={styles.photoUploader}>{photo.uploadedBy}</Text>
                    <TouchableOpacity
                      style={styles.deletePhotoButton}
                      onPress={() => handleDeletePhoto(photo.id)}
                    >
                      <MaterialIcons name="delete" size={20} color={COLORS.white} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )
        )}
        
        {photos.length > 0 && !tempPhotoUri && (
          <Text style={[styles.photoCount, { color: COLORS.textSecondary }]}>
            {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
          </Text>
        )}
      </View>

      {/* Event Chat Button */}
      <TouchableOpacity
        style={[styles.chatButton, { backgroundColor: COLORS.info }]}
        onPress={openEventChat}
        activeOpacity={0.8}
      >
        <MaterialIcons name="chat" size={22} color={COLORS.white} />
        <Text style={styles.chatButtonText}>💬 Join Event Chat</Text>
      </TouchableOpacity>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {/* Add to Calendar Button */}
        <TouchableOpacity
          style={[styles.calendarButton, { backgroundColor: COLORS.calendar }]}
          onPress={handleAddToCalendar}
          disabled={addingToCalendar}
          activeOpacity={0.8}
        >
          <View style={styles.buttonContent}>
            <MaterialIcons name="event" size={22} color={COLORS.white} />
            <Text style={styles.calendarButtonText}>
              {addingToCalendar ? 'Adding...' : translate('addToCalendar')}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Register/Unregister Button */}
        <TouchableOpacity
          style={[
            styles.registerButton, 
            { backgroundColor: registered ? COLORS.error : COLORS.primary }
          ]}
          onPress={registered ? handleUnregister : handleRegister}
          disabled={loading}
          activeOpacity={0.8}
        >
          <View style={styles.buttonContent}>
            <MaterialIcons 
              name={registered ? "cancel" : "check-circle"} 
              size={22} 
              color={COLORS.white} 
            />
            <Text style={styles.registerButtonText}>
              {registered ? 'Unregister' : 'Register'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Share Button */}
        <TouchableOpacity
          style={[styles.shareButton, { backgroundColor: COLORS.shareButton }]}
          onPress={handleShare}
          activeOpacity={0.8}
        >
          <View style={styles.buttonContent}>
            <MaterialIcons name="share" size={22} color={COLORS.white} />
            <Text style={styles.shareButtonText}>Share Event</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Review Modal */}
      <Modal
        visible={reviewModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: COLORS.white }]}>
            <Text style={[styles.modalTitle, { color: COLORS.textPrimary }]}>Write a Review</Text>
            
            <Text style={[styles.modalLabel, { color: COLORS.textSecondary }]}>Your Rating</Text>
            <StarRating
              rating={tempRating}
              onRatingChange={setTempRating}
              size={36}
              showNumber={false}
            />
            
            <Text style={[styles.modalLabel, { color: COLORS.textSecondary }]}>Your Review</Text>
            <TextInput
              style={[styles.reviewInput, { 
                backgroundColor: COLORS.background, 
                color: COLORS.textPrimary,
                borderColor: COLORS.border 
              }]}
              placeholder={translate('yourReview')}
              placeholderTextColor={COLORS.textSecondary}
              multiline
              numberOfLines={4}
              value={reviewText}
              onChangeText={setReviewText}
              textAlignVertical="top"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { 
                  backgroundColor: COLORS.background,
                  borderColor: COLORS.border 
                }]}
                onPress={() => {
                  setReviewModalVisible(false);
                  setReviewText('');
                }}
              >
                <Text style={[styles.cancelButtonText, { color: COLORS.textPrimary }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton, { backgroundColor: COLORS.rating }]}
                onPress={handleSubmitReview}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: { 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  name: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 12, 
    textAlign: 'center',
    lineHeight: 34,
  },
  categoryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    fontWeight: '600',
    fontSize: 14,
  },
  detailsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
  },
  detailRow: { 
    flexDirection: 'row', 
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  detailContent: {
    marginLeft: 15,
    flex: 1,
  },
  label: { 
    fontWeight: '600', 
    fontSize: 14, 
    marginBottom: 4,
  },
  detail: { 
    fontSize: 16, 
    lineHeight: 22,
  },
  descriptionSection: {
    marginTop: 10,
    paddingTop: 20,
    borderTopWidth: 1,
  },
  descriptionLabel: {
    fontWeight: '600', 
    fontSize: 16, 
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  // RATINGS & REVIEWS STYLES
  ratingsSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  averageRatingContainer: {
    alignItems: 'center',
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
  },
  averageRatingText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  averageRatingLabel: {
    fontSize: 14,
    marginTop: 5,
  },
  reviewCount: {
    fontSize: 12,
    marginTop: 2,
  },
  userRatingText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  writeReviewButton: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  writeReviewText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  reviewsList: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
  },
  reviewsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  reviewItem: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewAuthor: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 5,
  },
  reviewDate: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  moreReviews: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 10,
  },
  // PHOTO GALLERY STYLES
  gallerySection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
  },
  gallerySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  uploadPhotoButton: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  uploadPhotoText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  // PHOTO PREVIEW STYLES
  photoPreviewContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  photoPreviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  photoPreview: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    resizeMode: 'cover',
    marginBottom: 15,
  },
  photoPreviewButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  photoPreviewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  cancelPreviewButton: {
    borderWidth: 2,
  },
  donePreviewButton: {
  },
  cancelPreviewText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  donePreviewText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noPhotosContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noPhotosText: {
    fontSize: 16,
    marginTop: 15,
    fontWeight: '600',
  },
  noPhotosSubText: {
    fontSize: 13,
    marginTop: 5,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
  },
  photoUploader: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  deletePhotoButton: {
    padding: 2,
  },
  photoCount: {
    textAlign: 'center',
    marginTop: 15,
    fontSize: 13,
    fontWeight: '600',
  },
  // CHAT BUTTON STYLES
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  chatButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 15,
  },
  reviewInput: {
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    minHeight: 100,
    borderWidth: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  submitButton: {
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    gap: 12,
  },
  calendarButton: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  registerButton: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  shareButton: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  calendarButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
