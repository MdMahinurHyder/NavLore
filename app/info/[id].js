import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// IMPORTANT: Use the Web SDK imports
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig'; // Adjust the relative path if needed

export default function InfoScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaceDetails = async () => {
      try {
        // Universal Firebase fetch logic
        const docRef = doc(db, 'historicalPlaces', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPlace(docSnap.data());
        } else {
          console.log("No such document found!");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaceDetails();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading details...</Text>
      </View>
    );
  }

  if (!place) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
        <Text style={styles.error}>Historical site not found.</Text>
        <TouchableOpacity style={styles.backButtonInline} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Image with Back Button & Price Tag */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: place.image }} style={styles.image} />
        
        {/* Floating Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>

        {/* Floating Price Tag */}
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>{place.price || 'Free'}</Text>
        </View>
      </View>

      {/* Details Section */}
      <View style={styles.content}>
        <Text style={styles.title}>{place.name}</Text>
        
        <View style={styles.divider} />
        
        <Text style={styles.sectionTitle}>About This Site</Text>
        <Text style={styles.description}>{place.snippet || 'No description available for this location.'}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#050505', padding: 20 },
  loadingText: { color: '#888', marginTop: 10 },
  
  // Header Image Styles
  imageContainer: { position: 'relative', width: '100%', height: 350 },
  image: { width: '100%', height: '100%', borderBottomLeftRadius: 35, borderBottomRightRadius: 35 },
  
  // Floating Elements
  backButton: { position: 'absolute', top: 50, left: 20, backgroundColor: 'rgba(0,0,0,0.6)', padding: 12, borderRadius: 20 },
  priceTag: { position: 'absolute', bottom: -15, right: 30, backgroundColor: '#4ADE80', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
  priceText: { color: '#050505', fontWeight: 'bold', fontSize: 16 },
  
  // Content Styles
  content: { padding: 25, paddingTop: 35 },
  title: { fontSize: 34, color: '#FFF', fontWeight: '900', letterSpacing: 0.5 },
  divider: { height: 1, backgroundColor: '#222', marginVertical: 20 },
  sectionTitle: { fontSize: 16, color: '#4A90E2', fontWeight: '800', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1.5 },
  description: { fontSize: 16, color: '#BBB', lineHeight: 28 },
  
  // Error State Styles
  error: { color: '#FFF', fontSize: 18, marginTop: 15, marginBottom: 25 },
  backButtonInline: { backgroundColor: '#111', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 25, borderWidth: 1, borderColor: '#333' },
  backButtonText: { color: '#FFF', fontWeight: '600', fontSize: 16 }
});