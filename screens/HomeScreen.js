// screens/HomeScreen.js
import React, { useEffect, useState } from 'react';
import { 
    View, 
    Text, 
    FlatList, 
    Image, 
    TouchableOpacity, 
    StyleSheet, 
    SafeAreaView, 
    ActivityIndicator, 
    RefreshControl, 
    Modal, 
    ScrollView,
    Button,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

// Different aircraft registrations
const AIRCRAFT_REGISTRATIONS = [
  'HB-KDV', // Swiss aircraft
  'N271DV', // US aircraft
  'G-EUUU', // UK aircraft
  'VH-EBA', // Australian aircraft
  'JA8089', // Japanese aircraft
  'F-GSTC', // French aircraft
  'D-ABYT', // German aircraft
  'C-GEOU'  // Canadian aircraft
];

export default function HomeScreen({ route }) {
    const { username } = route.params;
    const [aircraft, setAircraft] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedAircraft, setSelectedAircraft] = useState(null);
    const { clickCount, incrementClickCount } = useAuth();

  const fetchSingleAircraft = async (registration) => {
    try {
      const response = await fetch(`https://api.adsbdb.com/v0/aircraft/${registration}`);
      const data = await response.json();
      if (data?.response?.aircraft) {
        return {
          ...data.response.aircraft,
          id: Math.random().toString() // Add unique id for each aircraft
        };
      }
      return null;
    } catch (error) {
      console.error(`Error fetching aircraft ${registration}:`, error);
      return null;
    }
  };

  const fetchAircraft = async () => {
    try {
      setLoading(true);
  
      
      const registrations = [...AIRCRAFT_REGISTRATIONS];
      while (registrations.length < 15) {
        const randomReg = `N${Math.floor(1000 + Math.random() * 9000)}${String.fromCharCode(65 + Math.random() * 26)}`;
        if (!registrations.includes(randomReg)) {
          registrations.push(randomReg);
        }
      }
  
      // Fetch aircraft data for all registrations
      const aircraftPromises = registrations.map(registration => fetchSingleAircraft(registration));
      const results = await Promise.all(aircraftPromises);
  
      // Filter valid aircraft and set the state
      const validResults = results.filter(aircraft => aircraft !== null);
      setAircraft(validResults.slice(0, 15)); 
    } catch (error) {
      console.error('Error fetching aircraft:', error);
      setAircraft([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  

  const onRefresh = () => {
    setRefreshing(true);
    fetchAircraft();
  };

  useEffect(() => {
    fetchAircraft();
  }, []);

  const renderItem = ({ item }) => {
    // Check if the image URL is valid
    const imageUrl = item.url_photo_thumbnail && item.url_photo_thumbnail.startsWith('http')
      ? item.url_photo_thumbnail
      : 'https://via.placeholder.com/300x200'; // Fallback to placeholder if invalid or missing
  
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          setSelectedAircraft(item); // Open modal with selected aircraft details
          incrementClickCount(); // Increment the click count
        }}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          onError={() => console.log('Error loading image for', item.registration)} // Optional error logging
        />
        <Text style={styles.title}>{item.type || 'Unknown Aircraft'}</Text>
      </TouchableOpacity>
    );
  };
  

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Aircraft Tracker</Text>
        <Text style={styles.headerSubtitle}>Welcome, {username}</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading aircraft data...</Text>
        </View>
      ) : (
        <FlatList
          data={aircraft}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          numColumns={3}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#007AFF']}
            />
          }
        />
      )}

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={incrementClickCount} // Call incrementClickCount when pressed
      >
        <Text style={styles.floatingButtonText}>{clickCount}</Text>
        <Text style={styles.floatingButtonLabel}>Clicks</Text>
      </TouchableOpacity>

      {selectedAircraft && (
        <Modal
          visible={true}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setSelectedAircraft(null)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <Image
                source={{ uri: selectedAircraft.url_photo_thumbnail || 'https://via.placeholder.com/300x200' }}
                style={styles.modalImage}
              />
              <Text style={styles.modalTitle}>{selectedAircraft.type || 'Unknown Aircraft'}</Text>
              <Text style={styles.modalText}>Manufacturer: {selectedAircraft.manufacturer || 'Unknown'}</Text>
              <Text style={styles.modalText}>Owner: {selectedAircraft.registered_owner || 'Unknown'}</Text>
              <Text style={styles.modalText}>Country: {selectedAircraft.registered_owner_country_name || 'Unknown'}</Text>
              <Text style={styles.modalText}>Registration: {selectedAircraft.registration}</Text>
              <Button title="Close" onPress={() => setSelectedAircraft(null)} />
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#007AFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
  listContainer: {
    padding: 10,
  },
  card: {
    flex: 1,
    margin: 5,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 5,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
  },
  floatingButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  floatingButtonLabel: {
    color: 'white',
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  modalContent: {
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    resizeMode: 'cover',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
});