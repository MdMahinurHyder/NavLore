// @ts-nocheck
import { Ionicons } from '@expo/vector-icons';
import polyline from '@mapbox/polyline';
import * as Location from 'expo-location';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

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

  const API_KEY = 'provide your api here';

  // Request location permissions and get location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "We need location access to show your position and give directions.");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  // Set destination if provided via params
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
        
        mapRef.current?.animateToRegion({
          ...newDest,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }, 1000);
      } else {
        Alert.alert("No results found");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePoiClick = (e) => {
    const { coordinate, name } = e.nativeEvent;
    setDestination({ latitude: coordinate.latitude, longitude: coordinate.longitude, name: name });
    handleClearRoute();
    Keyboard.dismiss();
  };

  const handleMapPress = async (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setDestination({ latitude, longitude, name: "Loading address..." });
    handleClearRoute();
    Keyboard.dismiss();

    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.results?.length > 0) {
        const shortName = data.results[0].formatted_address.split(',')[0];
        setDestination({ latitude, longitude, name: shortName });
      } else {
        setDestination({ latitude, longitude, name: "Dropped Pin" });
      }
    } catch (err) {
      setDestination({ latitude, longitude, name: "Dropped Pin" });
    }
  };

  const fetchDirections = async () => {
    if (!userLocation || !destination) {
        Alert.alert("Location required", "Please ensure your GPS is on and you have a destination selected.");
        return;
    }
    setIsFetchingRoute(true);

    try {
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${userLocation.latitude},${userLocation.longitude}&destination=${destination.latitude},${destination.longitude}&alternatives=true&key=${API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.routes.length > 0) {
        const parsedRoutes = data.routes.map(route => {
          const points = polyline.decode(route.overview_polyline.points);
          const coords = points.map(point => ({ latitude: point[0], longitude: point[1] }));
          return {
            coordinates: coords,
            distance: route.legs[0].distance.text,
            duration: route.legs[0].duration.text,
            bounds: route.bounds,
          };
        });

        setRoutes(parsedRoutes);
        setSelectedRouteIndex(0);
        setShowDirections(true);

        const bounds = data.routes[0].bounds;
        mapRef.current?.fitToCoordinates([
          { latitude: bounds.northeast.lat, longitude: bounds.northeast.lng },
          { latitude: bounds.southwest.lat, longitude: bounds.southwest.lng }
        ], { edgePadding: { top: 50, right: 50, bottom: 250, left: 50 }, animated: true });

      } else {
        Alert.alert('Directions Error', 'Could not find a route.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch directions.');
    } finally {
      setIsFetchingRoute(false);
    }
  };

  const handleClearRoute = () => {
    setShowDirections(false);
    setRoutes([]);
    setSelectedRouteIndex(0);
  };

  const handleClearPin = () => {
    setDestination(null);
    handleClearRoute();
    setSearchQuery('');
  };

  const cycleRoute = () => {
    if (routes.length > 1) {
      setSelectedRouteIndex((prevIndex) => (prevIndex + 1) % routes.length);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{ latitude: 23.8103, longitude: 90.4125, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
        showsUserLocation={true}
        onPress={handleMapPress}
        onPoiClick={handlePoiClick} 
      >
        {destination && (
          <Marker coordinate={destination} title={destination.name} />
        )}

        {showDirections && routes.map((route, index) => {
          const isSelected = index === selectedRouteIndex;
          return (
            <Polyline
              key={index}
              coordinates={route.coordinates}
              strokeWidth={isSelected ? 6 : 4}
              strokeColor={isSelected ? "#4A90E2" : "#999999"} 
              zIndex={isSelected ? 2 : 1}
            />
          );
        })}
      </MapView>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search place..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          {isSearching ? <ActivityIndicator color="#fff" /> : <Text style={styles.searchBtnText}>Go</Text>}
        </TouchableOpacity>
      </View>

      {destination && (
        <View style={styles.bottomCard}>
          <TouchableOpacity style={styles.closePinBtn} onPress={handleClearPin}>
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>

          <Text style={styles.placeName}>{destination.name}</Text>
          
          <TouchableOpacity 
            style={showDirections ? styles.actionButtonClear : styles.actionButton} 
            onPress={showDirections ? handleClearRoute : fetchDirections}
            disabled={isFetchingRoute}
          >
            {isFetchingRoute ? (
               <ActivityIndicator color="#FFF" />
            ) : (
               <Text style={styles.buttonText}>{showDirections ? "Clear Route" : "Get Directions"}</Text>
            )}
          </TouchableOpacity>

          {showDirections && routes.length > 0 && (
            <View style={styles.routeInfoContainer}>
              <Text style={styles.routeText}>{routes[selectedRouteIndex].duration} ({routes[selectedRouteIndex].distance})</Text>
              {routes.length > 1 && (
                <TouchableOpacity style={styles.switchRouteBtn} onPress={cycleRoute}>
                  <Ionicons name="swap-horizontal" size={16} color="#FFF" style={{marginRight: 6}} />
                  <Text style={styles.switchRouteText}>
                    Switch ({selectedRouteIndex + 1}/{routes.length})
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
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
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  routeInfoContainer: { marginTop: 12, alignItems: 'center' },
  routeText: { color: '#4CAF50', fontWeight: 'bold', fontSize: 16 },
  switchRouteBtn: { flexDirection: 'row', backgroundColor: '#4A90E2', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginTop: 10, alignItems: 'center' },
  switchRouteText: { color: '#FFF', fontWeight: 'bold' }
});