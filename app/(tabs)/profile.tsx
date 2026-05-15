import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../config/firebaseConfig';

export default function ProfileScreen() {
  const user = auth.currentUser;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [photoURL, setPhotoURL] = useState('');
  const [profile, setProfile] = useState({
    username: 'Traveler', profession: '', location: '', birthdate: '',
    gender: '', phone: '', hobbies: '', socialLinks: ''
  });

  useEffect(() => {
    if (user && !user.isAnonymous) fetchProfile();
    else setLoading(false);
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile(data as any);
        if (data.photoURL) setPhotoURL(data.photoURL);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const pickAndUploadImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const storageRef = ref(getStorage(), `avatars/${user?.uid}`);
      await uploadBytes(storageRef, blob);
      
      const downloadURL = await getDownloadURL(storageRef);
      await setDoc(doc(db, 'users', user!.uid), { photoURL: downloadURL }, { merge: true });
      
      setPhotoURL(downloadURL);
      Alert.alert('Success', 'Profile picture updated!');
    }
  };

  const saveProfile = async () => {
    if (!user || user.isAnonymous) return;
    try {
      await setDoc(doc(db, 'users', user.uid), profile, { merge: true });
      Alert.alert('✨ Success', 'Profile updated!');
    } catch (e) { Alert.alert('Error', 'Could not save'); }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1, backgroundColor: '#050505' }} color="#4A90E2" />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero Header */}
      <View style={styles.heroSection}>
        <TouchableOpacity onPress={pickAndUploadImage}>
          {photoURL ? (
            <Image source={{ uri: photoURL }} style={styles.avatar} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{profile.username[0]?.toUpperCase() || 'U'}</Text>
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.userName}>{profile.username}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      {/* Toggle Option */}
      <TouchableOpacity style={styles.toggleBtn} onPress={() => setShowDetails(!showDetails)}>
        <Text style={styles.toggleText}>{showDetails ? "Hide Details" : "Show more details"}</Text>
        <Ionicons name={showDetails ? "chevron-up" : "chevron-down"} size={16} color="#4A90E2" />
      </TouchableOpacity>

      {/* Collapsible Form */}
      {showDetails && (
        <View style={styles.detailsContainer}>
          {Object.entries(profile).map(([key, value]) => (
            <View key={key} style={styles.fieldWrapper}>
              <Text style={styles.label}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
              <TextInput 
                style={styles.input} 
                value={value} 
                onChangeText={(t) => setProfile({...profile, [key]: t})}
                placeholder={`Enter your ${key}...`}
                placeholderTextColor="#444"
              />
            </View>
          ))}
          <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
            <Text style={styles.saveButtonText}>Save Details</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.signOutButton} onPress={() => signOut(auth).then(() => router.replace('/login'))}>
        <Text style={styles.signOutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  content: { padding: 20 },
  heroSection: { alignItems: 'center', marginVertical: 30 },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#1e1e1e', justifyContent: 'center', alignItems: 'center', marginBottom: 15, borderWidth: 2, borderColor: '#4A90E2' },
  avatarText: { fontSize: 36, fontWeight: 'bold', color: '#4A90E2' },
  userName: { fontSize: 22, color: '#fff', fontWeight: 'bold' },
  userEmail: { fontSize: 14, color: '#666', marginTop: 5 },
  toggleBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 20 },
  toggleText: { color: '#4A90E2', marginRight: 8, fontWeight: '600' },
  detailsContainer: { marginTop: 10 },
  fieldWrapper: { marginBottom: 15 },
  label: { color: '#888', fontSize: 11, marginBottom: 5 },
  input: { backgroundColor: '#111', color: '#fff', padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#222', fontSize: 15 },
  saveButton: { backgroundColor: '#4A90E2', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: '#fff', fontWeight: 'bold' },
  signOutButton: { alignItems: 'center', marginTop: 40, marginBottom: 40 },
  signOutText: { color: '#ff4757', fontWeight: '600' }
});