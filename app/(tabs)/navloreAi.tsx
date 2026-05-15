// ts-nocheck
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth } from '../../config/firebaseConfig';

// provide your api here
const API_KEY = 'provide your api here';

export default function NavLoreAI() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);

  const userName = auth.currentUser?.displayName?.split(' ')[0] || 'Traveler';

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userText = inputText.trim();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage = { id: Date.now().toString(), text: userText, sender: 'user', time: timestamp };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    Keyboard.dismiss();

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: `You are NavLore AI, a charismatic historical guide. Keep answers concise. Question: ${userText}` }]
            }]
          }),
        }
      );

      const data = await response.json();
      const aiReply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "The archives are silent.";
      const aiTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), text: aiReply, sender: 'ai', time: aiTimestamp }]);
    } catch (error) {
      setMessages((prev) => [...prev, { id: Date.now().toString(), text: "Network error.", sender: 'ai', time: "" }]);
    } finally {
      setIsLoading(false);
    }
  };
  // ... rest of file (rendering and styles)

  const renderMessage = ({ item }) => (
    <View style={[styles.messageWrapper, item.sender === 'user' ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }]}>
      <View style={[styles.messageBubble, item.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.messageText, item.sender === 'user' ? styles.userMessageText : styles.aiMessageText]}>
          {item.text}
        </Text>
      </View>
      <Text style={styles.timestamp}>{item.time}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Modern Header */}
        <View style={styles.header}>
            <View>
                <Text style={styles.headerTitle}>NavLore AI</Text>
                <View style={styles.statusRow}>
                    <View style={styles.onlineDot} />
                    <Text style={styles.statusText}>History Expert Online</Text>
                </View>
            </View>
            <TouchableOpacity style={styles.infoBtn}>
                <Ionicons name="information-circle-outline" size={24} color="#888" />
            </TouchableOpacity>
        </View>
        
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatContainer}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.iconCircle}>
                <Ionicons name="library" size={40} color="#4A90E2" />
              </View>
              <Text style={styles.greeting}>Welcome, {userName}</Text>
              <Text style={styles.subGreeting}>Ask me about the secrets of any landmark or era.</Text>
            </View>
          }
        />

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#4A90E2" />
            <Text style={styles.loadingText}>Searching archives...</Text>
          </View>
        )}

        {/* Improved Glass-style Input */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity 
              style={[styles.sendButton, !inputText.trim() && { opacity: 0.5, backgroundColor: '#333' }]} 
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              <Ionicons name="arrow-up" size={24} color={inputText.trim() ? "#000" : "#666"} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 25, 
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A'
  },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: '800', letterSpacing: 0.5 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CAF50', marginRight: 6 },
  statusText: { color: '#888', fontSize: 12, fontWeight: '500' },
  infoBtn: { padding: 5 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 120, paddingHorizontal: 40 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  greeting: { color: '#FFF', fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
  subGreeting: { color: '#666', fontSize: 16, textAlign: 'center', marginTop: 10, lineHeight: 22 },
  chatContainer: { paddingHorizontal: 15, paddingBottom: 30, paddingTop: 10 },
  messageWrapper: { marginBottom: 15, width: '100%' },
  messageBubble: { maxWidth: '80%', padding: 14, borderRadius: 20 },
  userBubble: { backgroundColor: '#4A90E2', borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: '#1C1C1E', borderBottomLeftRadius: 4 },
  messageText: { fontSize: 16, lineHeight: 22 },
  userMessageText: { color: '#FFF', fontWeight: '500' },
  aiMessageText: { color: '#E5E5E7' },
  timestamp: { color: '#444', fontSize: 10, marginTop: 4, marginHorizontal: 5 },
  loadingContainer: { flexDirection: 'row', padding: 15, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#4A90E2', fontSize: 12, marginLeft: 8, fontWeight: '600' },
  inputWrapper: { paddingHorizontal: 15, paddingVertical: 20, backgroundColor: 'transparent' },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#1C1C1E', 
    borderRadius: 30, 
    paddingLeft: 20,
    paddingRight: 6,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#2C2C2E'
  },
  textInput: { flex: 1, color: '#FFF', fontSize: 16, paddingVertical: 8, maxHeight: 100 },
  sendButton: { 
    backgroundColor: '#FFF', 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
});