// src/utils/chatGenerator.js

const FAKE_USERS = [
  { name: 'Sarah Chen', avatar: '👩' },
  { name: 'Mike Johnson', avatar: '👨' },
  { name: 'Lisa Park', avatar: '👩‍🦰' },
  { name: 'David Kumar', avatar: '👨‍💼' },
  { name: 'Emma Wilson', avatar: '👩‍🎓' },
  { name: 'Alex Rodriguez', avatar: '👨‍🎓' },
  { name: 'Maya Thompson', avatar: '👩‍💻' },
  { name: 'Ryan Lee', avatar: '👨‍🔬' },
];

const MESSAGE_TEMPLATES = [
  "Can't wait for this event! 🎉",
  "Anyone coming from Building A?",
  "What time does it actually start?",
  "Is there parking nearby? 🚗",
  "This looks amazing! 😍",
  "First time attending, super excited!",
  "Will there be food? 🍕",
  "See you all there! 👋",
  "Anyone want to meet up before?",
  "Thanks for organizing this!",
  "How long does it usually last?",
  "Bringing my friends along!",
  "Hope the weather holds up! ☀️",
  "Perfect timing for me!",
  "Love this type of event! ❤️",
  "Who else is going? 👥",
  "Can we bring guests?",
  "This is going to be epic! 🔥",
  "Count me in! ✅",
  "Great idea! 💡",
];

// Generate initial chat history
export const generateInitialMessages = (eventName, count = 10) => {
  const messages = [];
  const now = Date.now();
  
  for (let i = 0; i < count; i++) {
    const user = FAKE_USERS[Math.floor(Math.random() * FAKE_USERS.length)];
    const template = MESSAGE_TEMPLATES[Math.floor(Math.random() * MESSAGE_TEMPLATES.length)];
    
    messages.push({
      id: `fake-${i}-${now}`,
      text: template,
      userName: user.name,
      avatar: user.avatar,
      timestamp: now - (count - i) * 60000 * 5, // Messages 5 minutes apart
      isUser: false,
    });
  }
  
  return messages;
};

// Generate a new random message
export const generateRandomMessage = () => {
  const user = FAKE_USERS[Math.floor(Math.random() * FAKE_USERS.length)];
  const template = MESSAGE_TEMPLATES[Math.floor(Math.random() * MESSAGE_TEMPLATES.length)];
  
  return {
    id: `fake-${Date.now()}-${Math.random()}`,
    text: template,
    userName: user.name,
    avatar: user.avatar,
    timestamp: Date.now(),
    isUser: false,
  };
};

// Format timestamp
export const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
  
  return `${displayHours}:${displayMinutes} ${ampm}`;
};
