// app/(tabs)/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#bb86fc', headerShown: false }}>
      <Tabs.Screen 
        name="index" 
        options={{ title: 'Home', tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} /> }} 
      />
      <Tabs.Screen 
        name="map" 
        options={{ title: 'Map', tabBarIcon: ({ color }) => <Ionicons name="map" size={24} color={color} /> }} 
      />
      {/* This is the ONLY NavLore AI screen you need */}
      <Tabs.Screen 
        name="navloreAi" 
        options={{ 
          title: 'NavLore AI', 
          tabBarIcon: ({ color }) => <Ionicons name="chatbox" size={24} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ title: 'Profile', tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} /> }} 
      />
    </Tabs>
  );
}