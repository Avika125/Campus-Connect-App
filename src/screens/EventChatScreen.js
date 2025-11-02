// src/screens/EventChatScreen.js

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { LIGHT_COLORS, DARK_COLORS } from '../constants/colors';
import { generateInitialMessages, generateRandomMessage, formatMessageTime } from '../utils/chatGenerator';

export default function EventChatScreen() {
  const { isDark } = useTheme();
  const COLORS = isDark ? DARK_COLORS : LIGHT_COLORS;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  
  const flatListRef = useRef();

  useEffect(() => {
    // Load initial fake messages
    const initial = generateInitialMessages('Event');
    setMessages(initial);

    // Setup interval to add random fake messages
    const interval = setInterval(() => {
      const newMsg = generateRandomMessage();
      setMessages((prev) => [...prev, newMsg]);
    }, 15000); // every 15 seconds

    return () => clearInterval(interval);
  }, []);

  const sendMessage = () => {
    if (input.trim().length === 0) return;
    
    const newMsg = {
      id: `user-${Date.now()}`,
      text: input.trim(),
      userName: 'You',
      avatar: '😊',
      timestamp: Date.now(),
      isUser: true,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput('');

    // Scroll to bottom after short delay
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderItem = ({ item }) => {
    const isUser = item.isUser;
    return (
      <View style={[
        styles.messageRow,
        { justifyContent: isUser ? 'flex-end' : 'flex-start' }
      ]}>
        {!isUser && (
          <Text style={styles.avatar}>{item.avatar}</Text>
        )}
        <View style={[
          styles.messageBubble,
          {
            backgroundColor: isUser ? COLORS.primary : COLORS.secondary,
            maxWidth: '75%',
          }
        ]}>
          <Text style={[styles.messageUser, { color: isUser ? COLORS.white : COLORS.textPrimary }]}>
            {item.userName}
          </Text>
          <Text style={[styles.messageText, { color: isUser ? COLORS.white : COLORS.textPrimary }]}>
            {item.text}
          </Text>
          <Text style={[styles.messageTime, { color: isUser ? COLORS.white : COLORS.textSecondary }]}>
            {formatMessageTime(item.timestamp)}
          </Text>
        </View>
        {isUser && (
          <Text style={styles.avatar}>{item.avatar}</Text>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: COLORS.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.chatContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={[styles.inputContainer, { borderTopColor: COLORS.border }]}>
        <TextInput
          style={[styles.textInput, { color: COLORS.textPrimary }]}
          placeholder="Type your message..."
          placeholderTextColor={COLORS.textSecondary}
          value={input}
          onChangeText={setInput}
          multiline={true}
        />
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: COLORS.primary }]}
          onPress={sendMessage}
          activeOpacity={0.7}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  chatContainer: { padding: 20, paddingBottom: 40 },
  messageRow: { flexDirection: 'row', marginVertical: 8 },
  avatar: { fontSize: 32, marginHorizontal: 8, alignSelf: 'flex-end' },
  messageBubble: { borderRadius: 16, padding: 12, shadowColor: '#000', shadowOffset: { width:0, height:1 }, shadowOpacity: 0.1, elevation: 2 },
  messageUser: { fontWeight: 'bold', marginBottom: 4, fontSize: 14 },
  messageText: { fontSize: 16 },
  messageTime: { fontSize: 11, color: '#666', marginTop: 4, alignSelf: 'flex-end' },
  inputContainer: { flexDirection: 'row', paddingHorizontal: 10, borderTopWidth: 1 },
  textInput: { flex: 1, fontSize: 16, paddingVertical: 10, paddingHorizontal: 12 },
  sendButton: { justifyContent: 'center', paddingHorizontal: 20, borderRadius: 10, marginLeft: 10 },
  sendButtonText: { fontWeight: 'bold', color: '#fff', fontSize: 16 },
});
