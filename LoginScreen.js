import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signInAnonymously, signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../config/firebaseConfig';

export default function LoginScreen() {
  const router = useRouter(); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Info', 'Please enter both your email and password.');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      await signInAnonymously(auth);
      // After success, _layout.tsx will automatically redirect via onAuthStateChanged
    } catch (error) {
      Alert.alert('Guest Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={require('../assets/images/worldMapPins.jpg')} style={styles.background}>
      <View style={styles.overlayContainer}>
        <Image source={require('../assets/images/NavLore.png')} style={styles.logo} resizeMode="contain" />
        
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#666" style={styles.icon} />
          <TextInput 
            style={styles.input} 
            placeholder="Email" 
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
            placeholder="Password" 
            placeholderTextColor="#888888" /* FIX: Makes placeholder visible */
            value={password} 
            onChangeText={setPassword} 
            secureTextEntry 
          />
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginButtonText}>Log In</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/register')}>
          <Text style={styles.linkTextOrange}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.guestButton} onPress={handleGuestLogin}>
          <Text style={styles.guestButtonText}>Continue as Guest</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  overlayContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: 'rgba(18, 18, 18, 0.85)' },
  logo: { width: 220, height: 220, marginBottom: 30 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.95)', width: '100%', maxWidth: 400, height: 50, borderRadius: 8, marginBottom: 15, paddingHorizontal: 15 },
  icon: { marginRight: 10 },
  input: { flex: 1, height: '100%', fontSize: 16, color: '#333' },
  loginButton: { backgroundColor: '#bb86fc', width: '100%', maxWidth: 400, height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 10, marginBottom: 20 },
  loginButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  linkTextOrange: { color: '#e74c3c', fontWeight: 'bold', fontSize: 14, marginBottom: 20 },
  guestButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.1)', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 25, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)' },
  guestButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});