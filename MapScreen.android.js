// @ts-nocheck
import { Ionicons } from '@expo/vector-icons';
import polyline from '@mapbox/polyline';
import * as Location from 'expo-location';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

export default function MapScreen() {
  const params = useLocalSearchParams(); 
  const mapRef = useRef(null);

  const [userLocation, setUserLocation] = useState(null);
  const [destination, setDestination] = useState(null); 
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const [routes, setRoutes] = useState([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [showDirections, setShowDirections] = useState(false);
  const [isFetchingRoute, setIsFetchingRoute] = useState(false);

  const API_KEY = 'AIzaSyApTGaiyrwLMC6-OcWmTwGx5uYcvd7Q3RY';

  // LOCATION PERMISSION (Same as iOS)
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Location access is required for directions.");
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    })();
  }, []);

  // HANDLE INCOMING PARAMS
  useEffect(() => {
    if (params?.lat && params?.lng) {
      const newDest = {
        latitude: parseFloat(params.lat),
        longitude: parseFloat(params.lng),
        name: params.title || "Selected Place"
      };
      setDestination(newDest);
      handleClearRoute();
      mapRef.current?.animateToRegion({
        ...newDest,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 1000);
    }
  }, [params.lat, params.lng]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    Keyboard.dismiss();
    setIsSearching(true);
    try {
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.results?.length > 0) {
        const place = data.results[0];
        const newDest = {
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
          name: place.name
        };
        setDestination(newDest);
        handleClearRoute();
        mapRef.current?.animateToRegion({ ...newDest, latitudeDelta: 0.05, longitudeDelta: 0.05 }, 1000);
      }
    } catch (e) { console.error(e); } finally { setIsSearching(false); }
  };

  const fetchDirections = async () => {
    if (!userLocation || !destination) return;
    setIsFetchingRoute(true);
    try {
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${userLocation.latitude},${userLocation.longitude}&destination=${destination.latitude},${destination.longitude}&alternatives=true&key=${API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === 'OK') {
        const parsedRoutes = data.routes.map(route => ({
          coordinates: polyline.decode(route.overview_polyline.points).map(p => ({ latitude: p[0], longitude: p[1] })),
          distance: route.legs[0].distance.text,
          duration: route.legs[0].duration.text,
        }));
        setRoutes(parsedRoutes);
        setShowDirections(true);
      }
    } catch (error) { Alert.alert('Error', 'Failed to fetch directions.'); } finally { setIsFetchingRoute(false); }
  };

  const handleClearRoute = () => { setShowDirections(false); setRoutes([]); setSelectedRouteIndex(0); };
  const handleClearPin = () => { setDestination(null); handleClearRoute(); setSearchQuery(''); };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{ latitude: 23.8103, longitude: 90.4125, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
        showsUserLocation={true}
        onPress={(e) => {
           const { latitude, longitude } = e.nativeEvent.coordinate;
           setDestination({ latitude, longitude, name: "Dropped Pin" });
           handleClearRoute();
        }}
      >
        {destination && <Marker coordinate={destination} title={destination.name} />}
        {showDirections && routes.map((r, i) => (
          <Polyline key={i} coordinates={r.coordinates} strokeWidth={i === selectedRouteIndex ? 6 : 4} strokeColor={i === selectedRouteIndex ? "#4A90E2" : "#999999"} />
        ))}
      </MapView>

      {/* Reusing Search and Bottom Card from iOS */}
      <View style={styles.searchContainer}>
        <TextInput style={styles.searchInput} placeholder="Search place..." value={searchQuery} onChangeText={setSearchQuery} />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          {isSearching ? <ActivityIndicator color="#fff" /> : <Text style={styles.searchBtnText}>Go</Text>}
        </TouchableOpacity>
      </View>

      {destination && (
        <View style={styles.bottomCard}>
          <TouchableOpacity style={styles.closePinBtn} onPress={handleClearPin}><Ionicons name="close" size={24} color="#FFF" /></TouchableOpacity>
          <Text style={styles.placeName}>{destination.name}</Text>
          <TouchableOpacity style={showDirections ? styles.actionButtonClear : styles.actionButton} onPress={showDirections ? handleClearRoute : fetchDirections}>
            <Text style={styles.buttonText}>{showDirections ? "Clear Route" : "Get Directions"}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  searchContainer: { position: 'absolute', top: 50, left: '5%', width: '90%', flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 8, padding: 10, elevation: 5, alignItems: 'center' },
  searchInput: { flex: 1, height: 40 },
  searchButton: { backgroundColor: '#4A90E2', padding: 10, borderRadius: 6, marginLeft: 10 },
  searchBtnText: { color: '#FFF', fontWeight: 'bold' },
  bottomCard: { position: 'absolute', bottom: 30, alignSelf: 'center', backgroundColor: '#1E1E1E', padding: 20, borderRadius: 20, width: '85%' },
  closePinBtn: { position: 'absolute', top: 12, right: 15, zIndex: 10 },
  placeName: { color: '#FFF', fontWeight: 'bold', fontSize: 18, marginBottom: 12, textAlign: 'center' },
  actionButton: { backgroundColor: '#4CAF50', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  actionButtonClear: { backgroundColor: '#E53935', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});