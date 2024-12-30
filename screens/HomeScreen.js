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
    StatusBar,
    Dimensions,
    Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const SCREEN_WIDTH = Dimensions.get('window').width;
const STATUSBAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight : 0;

const AIRCRAFT_REGISTRATIONS = [
    'HB-KDV', 'N271DV', 'G-EUUU', 'VH-EBA', 
    'JA8089', 'F-GSTC', 'D-ABYT', 'C-GEOU'
];

export default function HomeScreen({ route }) {
    const { username } = route.params;
    const [aircraft, setAircraft] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedAircraft, setSelectedAircraft] = useState(null);
    const [error, setError] = useState(null);
    const { clickCount, incrementClickCount } = useAuth();

    const fetchSingleAircraft = async (registration) => {
        try {
            const response = await fetch(`https://api.adsbdb.com/v0/aircraft/${registration}`);
            const data = await response.json();
            if (data?.response?.aircraft) {
                return {
                    ...data.response.aircraft,
                    id: Math.random().toString()
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
            setError(null);

            const registrations = [...AIRCRAFT_REGISTRATIONS];
            while (registrations.length < 15) {
                const randomReg = `N${Math.floor(1000 + Math.random() * 9000)}${String.fromCharCode(65 + Math.random() * 26)}`;
                if (!registrations.includes(randomReg)) {
                    registrations.push(randomReg);
                }
            }

            const aircraftPromises = registrations.map(registration => fetchSingleAircraft(registration));
            const results = await Promise.all(aircraftPromises);
            const validResults = results.filter(aircraft => aircraft !== null);
            setAircraft(validResults.slice(0, 15));
        } catch (error) {
            console.error('Error fetching aircraft:', error);
            setError('Failed to load aircraft data');
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
        const imageUrl = item.url_photo_thumbnail && item.url_photo_thumbnail.startsWith('http')
            ? { uri: item.url_photo_thumbnail }
            : require('../assets/placeholder.png');
        
        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => {
                    setSelectedAircraft(item);
                    incrementClickCount();
                }}
                activeOpacity={0.8}
            >
                <Image
                    source={imageUrl}
                    style={styles.image}
                    onError={() => console.log('Error loading image for', item.registration)}
                />
                <View style={styles.cardContent}>
                    <Text style={styles.aircraftType}>
                        {item.type || 'Unknown Aircraft'}
                    </Text>
                    <View style={styles.detailsContainer}>
                        <View style={styles.detail}>
                            <Text style={styles.detailLabel}>Registration</Text>
                            <Text style={styles.detailText}>{item.registration}</Text>
                        </View>
                        <View style={styles.detail}>
                            <Text style={styles.detailLabel}>Country</Text>
                            <Text style={styles.detailText}>
                                {item.registered_owner_country_name || 'Unknown'}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.owner} numberOfLines={1}>
                        {item.registered_owner || 'Unknown Owner'}
                    </Text>
                </View>
                <View style={styles.arrow}>
                    <Text style={styles.arrowText}>›</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <>
            <StatusBar
                barStyle="light-content"
                backgroundColor="#007AFF"
                translucent={true}
            />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Aircraft Tracker</Text>
                        <Text style={styles.headerSubtitle}>Welcome, {username}</Text>
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#007AFF" />
                            <Text style={styles.loadingText}>Loading aircraft data...</Text>
                        </View>
                    ) : error ? (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                            <TouchableOpacity
                                style={styles.retryButton}
                                onPress={fetchAircraft}
                            >
                                <Text style={styles.retryButtonText}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <FlatList
                            data={aircraft}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.listContainer}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                    colors={['#007AFF']}
                                />
                            }
                            ItemSeparatorComponent={() => <View style={styles.separator} />}
                        />
                    )}

                    <TouchableOpacity 
                        style={styles.floatingButton}
                        activeOpacity={0.9}
                    >
                        <Text style={styles.floatingButtonNumber}>{clickCount}</Text>
                        <Text style={styles.floatingButtonLabel}>Clicks</Text>
                    </TouchableOpacity>

                    {selectedAircraft && (
                        <Modal
                            visible={true}
                            animationType="slide"
                            transparent={true}
                            onRequestClose={() => setSelectedAircraft(null)}
                        >
                            <View style={styles.modalOverlay}>
                                <View style={styles.modalContainer}>
                                    <ScrollView contentContainerStyle={styles.modalContent}>
                                        <Image
                                            source={{ uri: selectedAircraft.url_photo_thumbnail || 'https://via.placeholder.com/300x200' }}
                                            style={styles.modalImage}
                                        />
                                        <Text style={styles.modalTitle}>
                                            {selectedAircraft.type || 'Unknown Aircraft'}
                                        </Text>
                                        <View style={styles.modalDetailsGrid}>
                                            <View style={styles.modalDetailItem}>
                                                <Text style={styles.modalDetailLabel}>Manufacturer</Text>
                                                <Text style={styles.modalDetailText}>
                                                    {selectedAircraft.manufacturer || 'Unknown'}
                                                </Text>
                                            </View>
                                            <View style={styles.modalDetailItem}>
                                                <Text style={styles.modalDetailLabel}>Registration</Text>
                                                <Text style={styles.modalDetailText}>
                                                    {selectedAircraft.registration}
                                                </Text>
                                            </View>
                                            <View style={styles.modalDetailItem}>
                                                <Text style={styles.modalDetailLabel}>Country</Text>
                                                <Text style={styles.modalDetailText}>
                                                    {selectedAircraft.registered_owner_country_name || 'Unknown'}
                                                </Text>
                                            </View>
                                            <View style={styles.modalDetailItem}>
                                                <Text style={styles.modalDetailLabel}>Owner</Text>
                                                <Text style={styles.modalDetailText}>
                                                    {selectedAircraft.registered_owner || 'Unknown'}
                                                </Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity
                                            style={styles.closeButton}
                                            onPress={() => setSelectedAircraft(null)}
                                        >
                                            <Text style={styles.closeButtonText}>Close</Text>
                                        </TouchableOpacity>
                                    </ScrollView>
                                </View>
                            </View>
                        </Modal>
                    )}
                </View>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: 'white',
        paddingTop: STATUSBAR_HEIGHT,
    },
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        padding: 20,
        backgroundColor: '#007AFF',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    headerTitle: {
        color: 'white',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    headerSubtitle: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 18,
        marginBottom: 16,
    },
    listContainer: {
        padding: 16,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        marginBottom: 2,
    },
    image: {
        width: 120,
        height: 120,
        resizeMode: 'cover',
    },
    cardContent: {
        flex: 1,
        padding: 16,
    },
    aircraftType: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#1a1a1a',
    },
    detailsContainer: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    detail: {
        marginRight: 16,
    },
    detailLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    detailText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    owner: {
        fontSize: 14,
        color: '#666',
    },
    arrow: {
        justifyContent: 'center',
        padding: 16,
    },
    arrowText: {
        fontSize: 24,
        color: '#007AFF',
    },
    separator: {
        height: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: SCREEN_WIDTH * 0.9,
        maxHeight: '80%',
        backgroundColor: 'white',
        borderRadius: 20,
        overflow: 'hidden',
    },
    modalContent: {
        alignItems: 'center',
    },
    modalImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 16,
        color: '#1a1a1a',
    },
    modalDetailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 16,
        width: '100%',
    },
    modalDetailItem: {
        width: '50%',
        marginBottom: 16,
    },
    modalDetailLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    modalDetailText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    closeButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginVertical: 16,
    },
    closeButtonText: {
        color: 'white',
        fontSize:16,
    },
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  },
  loadingText: {
      marginTop: 12,
      fontSize: 16,
      color: '#666',
  },
    errorText: {
        color: 'red',
        textAlign: 'center',
        fontSize: 16,
    },
    retryButton: {
      backgroundColor: '#007AFF',
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
  },
  retryButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
  },

  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#007AFF',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
},
floatingButtonNumber: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
},
floatingButtonLabel: {
    color: 'white',
    fontSize: 12,
    marginTop: 2,
},
});
