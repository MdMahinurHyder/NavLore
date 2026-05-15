// app/(tabs)/explore.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { FlatList, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const DIVISIONS = [
  'Barishal', 'Chattogram', 'Dhaka', 'Khulna', 
  'Rajshahi', 'Rangpur', 'Mymensingh', 'Sylhet'
];

const divisionImages: { [key: string]: any } = {
  'Barishal': require('../../assets/images/divisions/Barishal.jpg'),
  'Chattogram': require('../../assets/images/divisions/Chittagong.jpg'), 
  'Dhaka': require('../../assets/images/divisions/Dhaka.jpg'),
  'Khulna': require('../../assets/images/divisions/Khulna.jpg'), 
  'Rajshahi': require('../../assets/images/divisions/Rajshahi.jpg'),
  'Rangpur': require('../../assets/images/divisions/Rangpur.jpg'),
  'Mymensingh': require('../../assets/images/divisions/Mymensingh.jpg'),
  'Sylhet': require('../../assets/images/divisions/Sylhet.jpg'),
};

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      {/* Editorial Style Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Discover{"\n"}Heritage</Text>
        <View style={styles.subtitleRow}>
            <Ionicons name="compass" size={18} color="#4A90E2" />
            <Text style={styles.subtitle}>Journey through Bangladesh</Text>
        </View>
      </View>
      
      <FlatList
        data={DIVISIONS}
        numColumns={2}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Link 
            href={{ pathname: '/division/[name]', params: { name: item } }} 
            asChild
          >
            <TouchableOpacity style={styles.cardContainer} activeOpacity={0.85}>
              <ImageBackground 
                source={divisionImages[item]} 
                style={styles.backgroundImage}
                resizeMode="cover"
              >
                {/* 3-Stop gradient for a smoother cinematic fade */}
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.95)']}
                  style={styles.gradient}
                >
                  <View style={styles.cardContent}>
                    <Text style={styles.cardText}>{item}</Text>
                    {/* Subtle glassmorphism icon to encourage tapping */}
                    <View style={styles.iconContainer}>
                      <Ionicons name="arrow-forward" size={14} color="#FFF" />
                    </View>
                  </View>
                </LinearGradient>
              </ImageBackground>
            </TouchableOpacity>
          </Link>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#050505', 
    paddingHorizontal: 15 
  },
  
  // Header Styles
  headerContainer: { 
    marginTop: 60, 
    marginBottom: 25, 
    paddingHorizontal: 5 
  },
  title: { 
    fontSize: 38, 
    color: '#FFF', 
    fontWeight: '900', 
    letterSpacing: 0.5,
    lineHeight: 42
  },
  subtitleRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 12 
  },
  subtitle: { 
    fontSize: 16, 
    color: '#4A90E2', 
    fontWeight: '700', 
    marginLeft: 6, 
    letterSpacing: 0.5 
  },
  
  // List Styles
  listContainer: { 
    paddingBottom: 40 
  },
  columnWrapper: { 
    justifyContent: 'space-between', 
    marginBottom: 15 
  },
  
  // Card Styles
  cardContainer: {
    width: '47.5%', // Slightly adjusted to give a nice middle gutter
    height: 220,    // Taller cards for a more premium, immersive look
    borderRadius: 20,
    overflow: 'hidden', 
    backgroundColor: '#1e1e1e',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  backgroundImage: { 
    flex: 1, 
    width: '100%', 
    height: '100%', 
    justifyContent: 'flex-end' 
  },
  gradient: { 
    height: '60%', // Taller gradient to ensure readability
    justifyContent: 'flex-end', 
    padding: 15 
  },
  
  // Card Content
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },
  cardText: { 
    color: '#fff', 
    fontSize: 20, 
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 6,
    borderRadius: 15,
    backdropFilter: 'blur(10px)', // Adds a glass effect on supported platforms
  }
});