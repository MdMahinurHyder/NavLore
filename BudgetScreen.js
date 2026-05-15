import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function BudgetScreen() {
  return (
    <View style={styles.container}>
      {/* AI HEADER */}
      <View style={styles.header}>
        <Ionicons name="hardware-chip" size={30} color="#bb86fc" />
        <Text style={styles.headerTitle}>NavLore AI</Text>
      </View>

      <ScrollView style={styles.chatArea}>
        {/* AI MESSAGE */}
        <View style={styles.aiMessage}>
          <Text style={styles.messageText}>
            Hello! I am your NavLore AI guide. I see you have a budget of ৳1000 today. 
            {"\n\n"}Based on your budget, I suggest:
            {"\n"}• Rickshaw to Ahsan Manzil: ৳150
            {"\n"}• Entry Fee: ৳500
            {"\n"}• Lunch at local canteen: ৳250
            {"\n\n"}Would you like me to generate a walking route for the interior of the palace?
          </Text>
        </View>

        {/* USER MESSAGE */}
        <View style={styles.userMessage}>
          <Text style={styles.messageText}>Yes, show me the quickest route inside.</Text>
        </View>
      </ScrollView>

      {/* CHAT INPUT BAR */}
      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input} 
          placeholder="Ask AI for budget, routes, or history..." 
          placeholderTextColor="#888"
        />
        <TouchableOpacity style={styles.sendButton}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 50, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#333' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#bb86fc', marginLeft: 10 },
  chatArea: { flex: 1, padding: 20 },
  aiMessage: { backgroundColor: '#1e1e1e', padding: 15, borderRadius: 15, borderBottomLeftRadius: 0, marginBottom: 20, maxWidth: '85%' },
  userMessage: { backgroundColor: '#bb86fc', padding: 15, borderRadius: 15, borderBottomRightRadius: 0, marginBottom: 20, alignSelf: 'flex-end', maxWidth: '80%' },
  messageText: { color: '#fff', fontSize: 16, lineHeight: 24 },
  inputContainer: { flexDirection: 'row', padding: 15, backgroundColor: '#1e1e1e', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#2a2a2a', color: '#fff', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 12, marginRight: 10 },
  sendButton: { backgroundColor: '#bb86fc', padding: 12, borderRadius: 25 }
});