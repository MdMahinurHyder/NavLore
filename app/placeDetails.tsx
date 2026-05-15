import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, ImageBackground, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../config/firebaseConfig';

// provide your api here
const API_KEY = 'provide your api here';

export default function PlaceDetails() {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  
  const [place, setPlace] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  const fetchAISummary = async (name: string) => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `Write a short, engaging 2-sentence historical summary of ${name}.` }] }]
          }),
        }
      );
      const data = await response.json();
      const aiReply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (aiReply) setAiSummary(aiReply);
    } catch (error) {
      setAiSummary("Could not load historical insights.");
    }
  };

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    
    // Fetch data
    getDoc(doc(db, "historical_places", id))
      .then(snap => {
        if (snap.exists()) {
          const data = snap.data();
          setPlace(data);
          fetchAISummary(data.name);
        }
      })
      .catch(err => console.error("Error fetching place:", err))
      .finally(() => setLoading(false));

    const unsubscribe = onSnapshot(collection(db, "historical_places", id, "reviews"), (snap) => {
      const fetchedReviews = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      fetchedReviews.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setReviews(fetchedReviews);
    });

    return () => unsubscribe();
  }, [id]);

  // ... rest of file (styles and UI)

  // SUCCESS: This logic specifically handles the GeoPoint from your Firestore
  const goToInternalMap = () => {
    if (place?.location?.latitude && place?.location?.longitude) {
      router.push({
        pathname: '/map', // Ensure this matches your file structure
        params: { 
          lat: place.location.latitude, 
          lng: place.location.longitude, 
          title: place.name 
        }
      });
    } else {
      alert("Coordinates missing. Ensure Firestore has a GeoPoint named 'location'.");
    }
  };

  const handlePostReview = async () => {
    if (!comment.trim()) return;
    try {
      await addDoc(collection(db, "historical_places", id, "reviews"), { 
        user: auth.currentUser?.email || "Anonymous", 
        comment: comment.trim(), 
        timestamp: new Date().toISOString() 
      });
      setComment('');
    } catch (error) {
      console.error("Error posting review: ", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  const imageUrl = Array.isArray(place?.images) && place?.images.length > 0 ? place.images[0] : place?.image;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} bounces={false}>
      <View style={styles.heroContainer}>
        <ImageBackground source={imageUrl ? { uri: imageUrl } : undefined} style={[styles.heroImage, !imageUrl && { backgroundColor: '#111' }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)', '#050505']} style={styles.heroGradient}>
            <Text style={styles.title}>{place?.name || "Unknown Place"}</Text>
          </LinearGradient>
        </ImageBackground>
      </View>

      <View style={styles.contentContainer}>
        <TouchableOpacity style={styles.mapButton} onPress={goToInternalMap} activeOpacity={0.8}>
          <Ionicons name="map-outline" size={20} color="#FFF" />
          <Text style={styles.mapButtonText}>Show on Map</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>History & Details</Text>
        <Text style={styles.desc}>
          {place?.description || place?.history || "No details available."}
        </Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>AI Historical Insight</Text>
        <Text style={styles.desc}>{aiSummary || "Loading insight..."}</Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Traveler Reviews ({reviews.length})</Text>
        
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Write a review..."
            placeholderTextColor="#666"
            value={comment}
            onChangeText={setComment}
          />
          <TouchableOpacity onPress={handlePostReview} style={styles.sendIcon}>
            <Ionicons name="send" size={24} color="#4A90E2" />
          </TouchableOpacity>
        </View>

        <FlatList 
          scrollEnabled={false} 
          data={reviews} 
          keyExtractor={(item) => item.id} 
          renderItem={({ item }) => (
            <View style={styles.reviewItem}>
              <Text style={styles.reviewUser}>{item.user?.split('@')[0] || "Anonymous"}</Text>
              <Text style={styles.reviewText}>{item.comment}</Text>
            </View>
          )} 
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heroContainer: { height: 400 },
  heroImage: { flex: 1 },
  heroGradient: { flex: 1, justifyContent: 'flex-end', padding: 20 },
  backButton: { position: 'absolute', top: 50, left: 20, padding: 12, zIndex: 10 },
  title: { fontSize: 36, color: '#FFF', fontWeight: '900' },
  contentContainer: { padding: 20 },
  mapButton: { flexDirection: 'row', backgroundColor: '#4A90E2', padding: 14, borderRadius: 25, marginBottom: 20, alignItems: 'center', justifyContent: 'center' },
  mapButtonText: { color: '#FFF', fontWeight: 'bold', marginLeft: 8 },
  sectionTitle: { fontSize: 20, color: '#FFF', fontWeight: '800', marginTop: 20 },
  desc: { color: '#BBB', fontSize: 16, lineHeight: 26, marginTop: 10 },
  divider: { height: 1, backgroundColor: '#222', marginVertical: 30 },
  reviewItem: { backgroundColor: '#111', padding: 15, borderRadius: 15, marginBottom: 10 },
  reviewUser: { color: '#FFF', fontWeight: 'bold', marginBottom: 4 },
  reviewText: { color: '#AAA' },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, backgroundColor: '#111', borderRadius: 25, paddingHorizontal: 15 },
  input: { flex: 1, color: '#FFF', paddingVertical: 12, fontSize: 16 },
  sendIcon: { marginLeft: 10 }
});