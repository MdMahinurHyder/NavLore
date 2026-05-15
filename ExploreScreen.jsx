import { Ionicons } from '@expo/vector-icons';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 1. Mock Data
const CATEGORIES = [
  { name: 'All', icon: 'apps' },
  { name: 'Mughal Era', icon: 'castle' },
  { name: 'Colonial', icon: 'business' },
  { name: 'Religious', icon: 'moon' },
];

const EXPLORE_SPOTS = [
  { id: '1', name: 'Star Mosque', type: 'Religious', image: 'https://images.unsplash.com/photo-1600298882283-40b4dcb8b211?q=80&w=500' },
  { id: '2', name: 'Curzon Hall', type: 'Colonial', image: 'https://images.unsplash.com/photo-1588691516089-646e7f8faee1?q=80&w=500' },
  { id: '3', name: 'Dhakeshwari', type: 'Religious', image: 'https://images.unsplash.com/photo-1662963063558-86f376cc684a?q=80&w=500' },
  { id: '4', name: 'Rose Garden', type: 'Mansion', image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=500' },
  { id: '5', name: 'Sonargaon', type: 'Ancient City', image: 'https://images.unsplash.com/photo-1600298882283-40b4dcb8b211?q=80&w=500' },
  { id: '6', name: 'National Museum', type: 'Museum', image: 'https://images.unsplash.com/photo-1588691516089-646e7f8faee1?q=80&w=500' }
];

// 2. The Main Component (Must have 'export default'!)
export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover Dhaka</Text>
        <Ionicons name="filter" size={24} color="#bb86fc" />
      </View>

      {/* Filter Chips */}
      <View style={{ paddingBottom: 15 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {CATEGORIES.map((cat, index) => (
            <TouchableOpacity key={index} style={[styles.filterChip, index === 0 && styles.activeFilterChip]}>
              <Ionicons name={cat.icon} size={16} color={index === 0 ? "#000" : "#fff"} style={{ marginRight: 6 }} />
              <Text style={[styles.filterText, index === 0 && styles.activeFilterText]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Grid of Locations */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.gridContainer}>
          {EXPLORE_SPOTS.map((spot) => (
            <TouchableOpacity key={spot.id} style={styles.gridItem}>
              <Image source={{ uri: spot.image }} style={styles.gridImage} />
              <View style={styles.gridOverlay}>
                <Text style={styles.spotName}>{spot.name}</Text>
                <Text style={styles.spotType}>{spot.type}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// 3. Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingHorizontal: 20, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  filterScroll: { flexDirection: 'row' },
  filterChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e1e1e', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 25, marginRight: 12, borderWidth: 1, borderColor: '#333' },
  activeFilterChip: { backgroundColor: '#bb86fc', borderColor: '#bb86fc' },
  filterText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  activeFilterText: { color: '#000' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingBottom: 30 },
  gridItem: { width: '48%', height: 200, marginBottom: 15, borderRadius: 15, overflow: 'hidden', backgroundColor: '#1e1e1e' },
  gridImage: { width: '100%', height: '100%', position: 'absolute' },
  gridOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end', padding: 12 },
  spotName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  spotType: { color: '#bb86fc', fontSize: 12, marginTop: 4, fontWeight: 'bold' }
});