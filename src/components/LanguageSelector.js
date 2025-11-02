// src/components/LanguageSelector.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { 
  AVAILABLE_LANGUAGES, 
  getCurrentLanguage, 
  changeLanguage,
  translate 
} from '../utils/i18n';

const LanguageSelector = ({ visible, onClose, onLanguageChange }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [scaleAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadCurrentLanguage();
  }, []);

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const loadCurrentLanguage = async () => {
    const current = getCurrentLanguage();
    setSelectedLanguage(current);
  };

  const handleLanguageSelect = async (languageCode) => {
    setSelectedLanguage(languageCode);
    await changeLanguage(languageCode);
    
    // Call parent callback
    if (onLanguageChange) {
      onLanguageChange(languageCode);
    }
    
    // Close modal after selection
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{translate('selectLanguage')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Language Options */}
          <View style={styles.languageList}>
            {AVAILABLE_LANGUAGES.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageItem,
                  selectedLanguage === language.code && styles.languageItemSelected,
                ]}
                onPress={() => handleLanguageSelect(language.code)}
                activeOpacity={0.7}
              >
                <View style={styles.languageContent}>
                  <Text style={styles.flagText}>{language.flag}</Text>
                  <Text style={[
                    styles.languageName,
                    selectedLanguage === language.code && styles.languageNameSelected,
                  ]}>
                    {language.name}
                  </Text>
                </View>
                
                {selectedLanguage === language.code && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Info Text */}
          <Text style={styles.infoText}>
            Your language preference will be saved
          </Text>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.languageLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 18,
    color: COLORS.language,
    fontWeight: 'bold',
  },
  languageList: {
    marginBottom: 15,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageItemSelected: {
    backgroundColor: COLORS.languageLight,
    borderColor: COLORS.language,
  },
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagText: {
    fontSize: 32,
    marginRight: 15,
  },
  languageName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  languageNameSelected: {
    color: COLORS.language,
    fontWeight: 'bold',
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.language,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 5,
    fontStyle: 'italic',
  },
});

export default LanguageSelector;
