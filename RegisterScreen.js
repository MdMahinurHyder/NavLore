import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../config/firebaseConfig';

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !username) {
      Alert.alert('Missing Info', 'Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const uid = userCredential.user.uid;
      const role = (adminCode === "ADMIN123") ? "admin" : "user";

      // Standardize the document structure for ALL users
      await setDoc(doc(db, "users", uid), {
        username: username,
        email: email.trim(),
        role: role,
        profession: "",
        location: "",
        birthdate: "",
        gender: "",
        phone: "",
        hobbies: "",
        socialLinks: "",
        profilePic: "",
        createdAt: new Date().toISOString()
      });

      Alert.alert('Success', 'Account created as ' + role);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Registration Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={require('../assets/images/worldMapPins.jpg')} style={styles.background}>
      <View style={styles.overlayContainer}>
        <Image source={require('../assets/images/NavLore.png')} style={styles.logo} resizeMode="contain" />
        
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#666" style={styles.icon} />
          <TextInput 
            style={styles.input} 
            placeholder="Username" 
            placeholderTextColor="#888888" /* FIX: Makes placeholder visible */
            value={username} 
            onChangeText={setUsername} 
            autoCapitalize="none" 
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#666" style={styles.icon} />
          <TextInput 
            style={styles.input} 
            placeholder="Email Address" 
            placeholderTextColor="#888888" /* FIX: Makes placeholder visible */
            value={email} 
            onChangeText={setEmail} 
            autoCapitalize="none" 
            keyboardType="email-address" 
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.icon} />
          <TextInput 
            style={styles.input} 
            placeholder="Create Password" 
            placeholderTextColor="#888888" /* FIX: Makes placeholder visible */
            value={password} 
            onChangeText={setPassword} 
            secureTextEntry 
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="shield-outline" size={20} color="#666" style={styles.icon} />
          <TextInput 
            style={styles.input} 
            placeholder="Admin Code (Optional)" 
            placeholderTextColor="#888888" /* FIX: Makes placeholder visible */
            value={adminCode} 
            onChangeText={setAdminCode} 
            secureTextEntry 
          />
        </View>
        
        <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/login')}>
          <Text style={styles.linkTextBlue}>Already have an account? Log In.</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}


const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  overlayContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: 'rgba(34, 37, 41, 0.7)' },
  logo: { width: 150, height: 150, marginBottom: 20 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.95)', width: '100%', maxWidth: 400, height: 50, borderRadius: 8, marginBottom: 15, paddingHorizontal: 15 },
  icon: { marginRight: 10 },
  input: { flex: 1, height: '100%', fontSize: 16, color: '#333' },
  registerButton: { backgroundColor: '#e67e22', width: '100%', maxWidth: 400, height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 10, marginBottom: 20 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  linkRow: { flexDirection: 'row', alignItems: 'center' },
  linkTextPlain: { color: '#ccc', fontSize: 14 },
  linkTextBlue: { color: '#3498db', fontWeight: 'bold', fontSize: 14 }
});