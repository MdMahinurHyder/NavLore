import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../config/firebaseConfig';

export default function HomeScreen() {
  const [allLocations, setAllLocations] = useState([]); 
  const [displayLocations, setDisplayLocations] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [notFound, setNotFound] = useState(false); 
  
  const router = useRouter();

  // Load locations from Firestore
  useEffect(() => {
    const colRef = collection(db, 'historical_places'); 
    
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const places = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllLocations(places);
      const shuffled = [...places].sort(() => Math.random() - 0.5).slice(0, 10);
      setDisplayLocations(shuffled);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const handleSearch = () => {
    if (!search.trim()) {
      setNotFound(false);
      return;
    }
    
    const formattedSearch = search.trim().toLowerCase();
    const found = allLocations.find(loc => loc.name?.toLowerCase().includes(formattedSearch));
    
    if (found) {
      setNotFound(false); 
      router.push({ pathname: '/placeDetails', params: { id: found.id } });
    } else {
      setNotFound(true); 
    }
  };

  const clearSearch = () => {
    setSearch('');
    setNotFound(false);
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#4A90E2" />
      <Text style={{color: '#888', marginTop: 10}}>Loading Dhaka's history...</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Discover Dhaka</Text>
        <Text style={styles.subGreeting}>{allLocations.length} SITES READY FOR EXPLORATION</Text>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color="#888" />
        <TextInput 
          placeholder="Search for a site..." 
          placeholderTextColor="#666" 
          style={styles.input}
          value={search}
          onChangeText={(text) => {
            setSearch(text);
            if (notFound) setNotFound(false); 
          }}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={clearSearch}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {notFound ? (
        <View style={styles.notFoundContainer}>
          <Ionicons name="map-outline" size={80} color="#222" />
          <Text style={styles.notFoundTitle}>Location Not Found</Text>
          <Text style={styles.notFoundSub}>
            We couldn't find any historical site matching "{search}". Please check your spelling or try another name.
          </Text>
          <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
            <Text style={styles.clearButtonText}>Clear Search</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.grid}>
          {displayLocations.length > 0 ? (
            displayLocations.map((loc) => {
              const imageUrl = Array.isArray(loc.images) && loc.images.length > 0 
                ? loc.images[0] 
                : loc.image;

              return (
                <TouchableOpacity 
                  key={loc.id} 
                  style={styles.card} 
                  activeOpacity={0.7} 
                  onPress={() => router.push({ pathname: '/placeDetails', params: { id: loc.id } })}
                >
                  {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={styles.image} />
                  ) : (
                    <View style={[styles.image, { backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center' }]}>
                       <Ionicons name="image-outline" size={24} color="#444" />
                    </View>
                  )}

                  <View style={styles.infoArea}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{loc.name}</Text>
                    {loc.price && <Text style={styles.price}>{loc.price}</Text>}
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={{color: '#888', textAlign: 'center', width: '100%', marginTop: 20}}>No historical sites found.</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#050505' },
  header: { marginTop: 50, marginBottom: 20 },
  greeting: { fontSize: 32, fontWeight: '900', color: '#FFF' },
  subGreeting: { color: '#4A90E2', fontSize: 14, fontWeight: '600', marginTop: 5, textTransform: 'uppercase', letterSpacing: 1 },
  searchBox: { flexDirection: 'row', backgroundColor: '#111', padding: 18, borderRadius: 20, marginVertical: 20, alignItems: 'center', borderWidth: 1, borderColor: '#222' },
  input: { marginLeft: 10, color: '#FFF', flex: 1, fontSize: 16 },
  notFoundContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 40, paddingHorizontal: 20 },
  notFoundTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginTop: 20 },
  notFoundSub: { color: '#888', fontSize: 15, textAlign: 'center', marginTop: 12, lineHeight: 22 },
  clearButton: { marginTop: 30, backgroundColor: '#4A90E2', paddingVertical: 14, paddingHorizontal: 30, borderRadius: 25 },
  clearButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', height: 250, backgroundColor: '#111', borderRadius: 25, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
  image: { width: '100%', height: '70%', borderTopLeftRadius: 25, borderTopRightRadius: 25 },
  infoArea: { padding: 15 },
  cardTitle: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  price: { color: '#4ADE80', fontSize: 13, marginTop: 4, fontWeight: '700' }
});