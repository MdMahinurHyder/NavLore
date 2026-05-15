import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
// ADDED Linking and Platform
import { ActivityIndicator, FlatList, ImageBackground, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Adjust the import path if needed!
import { db } from '../../config/firebaseConfig';

export default function DivisionPlaces() {
  const params = useLocalSearchParams();
  const divisionName = Array.isArray(params.name) ? params.name[0] : params.name;
  const router = useRouter();
  
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!divisionName) {
      setLoading(false);
      return;
    }

    const fetchPlaces = async () => {
      try {
        const q = query(
          collection(db, "historical_places"), 
          where("division", "==", divisionName)
        );
        
        const querySnapshot = await getDocs(q);
        const fetchedPlaces = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setPlaces(fetchedPlaces);
      } catch (error) {
        console.error("Error fetching division places:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [divisionName]);

  // NEW: The safe native map opener
  const openInNativeMap = (item: any) => {
    let lat = item?.latitude;
    let lng = item?.longitude;

    if (!lat || !lng) {
      if (item?.location && typeof item.location === 'string') {
        const matches = item.location.match(/-?\d+(\.\d+)?/g);
        if (matches && matches.length >= 2) {
          lat = matches[0];
          lng = matches[1];
        }
      }
    }

    if (lat && lng) {
      const scheme = Platform.select({ ios: 'maps://0,0?q=', android: 'geo:0,0?q=' });
      const latLng = `${lat},${lng}`;
      const label = item?.name || 'Historical Place';
      const url = Platform.select({
        ios: `${scheme}${label}&ll=${latLng}`,
        android: `${scheme}${latLng}(${label})`
      });

      Linking.openURL(url as string);
    } else {
      alert("No coordinates available for this place.");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#e67e22" />
        <Text style={styles.loadingText}>Unearthing {divisionName}...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sleek, Modern Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </View>
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerSubtitle}>Explore</Text>
          <Text style={styles.headerTitle}>{divisionName} Sites</Text>
        </View>
      </View>

      {/* List of Places */}
      <FlatList
        data={places}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="map-outline" size={60} color="#333" />
            <Text style={styles.emptyText}>No historical sites discovered here yet.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const imageUrl = Array.isArray(item.images) && item.images.length > 0 
            ? item.images[0] 
            : item.image;

          return (
            <TouchableOpacity 
              style={styles.card}
              activeOpacity={0.9}
              onPress={() => router.push({ pathname: '/placeDetails', params: { id: item.id } })}
            >
              <ImageBackground 
                source={imageUrl ? { uri: imageUrl } : undefined} 
                style={[styles.cardImage, !imageUrl && { backgroundColor: '#1a1a1a' }]}
                resizeMode="cover"
              >
                 {!imageUrl && (
                    <View style={styles.placeholderContainer}>
                        <Ionicons name="image-outline" size={40} color="#444" />
                    </View>
                 )}
                 <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.95)']}
                    style={styles.gradient}
                  >
                    <View style={styles.cardContent}>
                      <View style={styles.textWrapper}>
                        <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
                        <View style={styles.locationRow}>
                          <Ionicons name="location-sharp" size={14} color="#e67e22" />
                          <Text style={styles.locationText}>{divisionName}, Bangladesh</Text>
                        </View>
                      </View>
                      
                      {/* UPDATED: View in Map Button */}
                      <TouchableOpacity 
                        style={styles.mapButtonGlass}
                        activeOpacity={0.7}
                        onPress={(e) => {
                          e.stopPropagation(); // Prevents the card click from triggering
                          openInNativeMap(item); // Safely opens Apple/Google Maps
                        }}
                      >
                        <Ionicons name="map" size={18} color="#FFF" />
                        <Text style={styles.mapButtonText}>Map</Text>
                      </TouchableOpacity>
                    </View>
                  </LinearGradient>
              </ImageBackground>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#050505' },
  loadingText: { color: '#888', marginTop: 15, fontSize: 16, fontWeight: '500' },
  
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: '#050505' },
  backButton: { marginRight: 15 },
  iconCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  headerTextContainer: { flex: 1 },
  headerSubtitle: { color: '#e67e22', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5 },
  headerTitle: { fontSize: 28, color: '#FFF', fontWeight: '900', letterSpacing: 0.5, marginTop: 2 },
  
  listContainer: { paddingHorizontal: 15, paddingBottom: 40, paddingTop: 10 },
  card: { height: 240, width: '100%', marginBottom: 20, borderRadius: 20, overflow: 'hidden', backgroundColor: '#1e1e1e', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.6, shadowRadius: 8 },
  cardImage: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  placeholderContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  
  gradient: { height: '65%', justifyContent: 'flex-end', padding: 20 },
  cardContent: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  textWrapper: { flex: 1, paddingRight: 10 },
  cardTitle: { color: '#FFF', fontSize: 24, fontWeight: '800', marginBottom: 8, textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationText: { color: '#ddd', fontSize: 14, fontWeight: '600', marginLeft: 4, letterSpacing: 0.5 },
  
  mapButtonGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(230, 126, 34, 0.85)', 
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  mapButtonText: { color: '#FFF', fontSize: 14, fontWeight: 'bold', marginLeft: 6 },
  
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 15, fontSize: 16, fontWeight: '500' }
});