import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../config/firebaseConfig';

export default function ProfileScreen() {
  const [userData, setUserData] = useState({});
  const isGuest = auth.currentUser?.isAnonymous;

  // Listen to profile updates
  useEffect(() => {
    if (auth.currentUser && !isGuest) {
      const docRef = doc(db, "users", auth.currentUser.uid);
      const unsubscribe = onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
          setUserData(doc.data());
        }
      });
      return unsubscribe;
    }
  }, []);

  const handleSaveChanges = () => {
     // TODO: Implement save logic
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarPlaceholder}>
          <Ionicons name="person" size={50} color="#aaa" />
        </View>
        <Text style={styles.userName}>{isGuest ? 'Guest Explorer' : (userData.username || 'User')}</Text>
        <Text style={styles.userEmail}>{isGuest ? 'No email linked' : userData.email}</Text>
        <View style={styles.proBadge}>
          <Text style={styles.proText}>{isGuest ? 'GUEST' : (userData.role?.toUpperCase() || 'USER')}</Text>
        </View>
      </View>

      <View style={styles.detailsCard}>
        {isGuest ? (
          <Text>Please sign in to manage your profile.</Text>
        ) : (
          <>
            <Text style={styles.label}>PROFESSION</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Enter your profession..." 
              value={userData.profession || ''} 
              onChangeText={(text) => setUserData({...userData, profession: text})}
            />
            
            <Text style={styles.label}>SOCIAL LINKS</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Enter your social links..." 
              value={userData.socialLinks || ''} 
              onChangeText={(text) => setUserData({...userData, socialLinks: text})}
            />

            <Text style={styles.label}>LOCATION</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Enter your location..." 
              value={userData.location || ''} 
              onChangeText={(text) => setUserData({...userData, location: text})}
            />

            <Text style={styles.label}>BIRTHDATE</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Enter your birthdate..." 
              value={userData.birthdate || ''} 
              onChangeText={(text) => setUserData({...userData, birthdate: text})}
            />

            <Text style={styles.label}>USERNAME</Text>
            <TextInput 
              style={styles.input} 
              value={userData.username || ''} 
              editable={false} 
            />
            
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
              <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={() => signOut(auth)}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  profileHeader: { alignItems: 'center', marginTop: 40, marginBottom: 30 },
  avatarPlaceholder: { width: 100, height: 100, backgroundColor: '#2a2a2a', borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 15, borderWidth: 2, borderColor: '#bb86fc' },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  userEmail: { fontSize: 16, color: '#aaa', marginTop: 5 },
  proBadge: { backgroundColor: '#bb86fc', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 10 },
  proText: { color: '#000', fontWeight: 'bold', fontSize: 12 },
  detailsCard: { backgroundColor: '#1e1e1e', padding: 20, borderRadius: 15, marginBottom: 20 },
  label: { color: '#888', fontSize: 12, fontWeight: 'bold', marginTop: 15, marginBottom: 5 },
  input: { backgroundColor: '#2a2a2a', color: '#fff', padding: 12, borderRadius: 8 },
  saveButton: { backgroundColor: '#bb86fc', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  logoutButton: { backgroundColor: '#e74c3c', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 50 },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});