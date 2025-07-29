import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Linking, Platform } from 'react-native';

export default function LocationPickerScreen({ navigation, route }) {
    const [location, setLocation] = useState(null);
    const [address, setAddress] = useState(null);
    const [mapReady, setMapReady] = useState(false);
    const mapRef = useRef(null);

    // Get return screen and form data from route params
    const returnScreen = route?.params?.returnScreen;
    const formData = route?.params?.formData;

    useEffect(() => {
        (async () => {
            try {
                const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();

                if (status !== 'granted') {
                    if (!canAskAgain) {
                        alert(
                            'Location permission was denied permanently. Please enable it in your phone settings.'
                        );
                        Linking.openSettings();
                    } else {
                        alert('Location permission is required to pick your address.');
                    }
                    return;
                }

                const currentLoc = await Location.getCurrentPositionAsync({});
                const { latitude, longitude } = currentLoc.coords;
                setLocation({ latitude, longitude });
                reverseGeocode(latitude, longitude);
            } catch (error) {
                console.warn('Location error:', error);
                // Set default location (Lahore) if current location fails
                setLocation({ latitude: 31.5204, longitude: 74.3587 });
            }
        })();
    }, []);

    const reverseGeocode = async (lat, lon) => {
        try {
            const result = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
            if (result.length > 0) {
                const a = result[0];
                setAddress(`${a.formattedAddress || ''} + Longitude:${lon || ''} + Latitude:${lat || ''}`);
            }
        } catch (error) {
            console.warn('Reverse geocoding failed:', error);
            // Fallback address format
            setAddress(`Longitude:${lon || ''} + Latitude:${lat || ''}`);
        }
    };

    const handleMapPress = (e) => {
        const { latitude, longitude } = e.nativeEvent.coordinate;
        setLocation({ latitude, longitude });
        reverseGeocode(latitude, longitude);
    };

    const handleMapReady = () => {
        setMapReady(true);
        console.log('Google Maps is ready');
    };

    const recenterToUser = async () => {
        try {
            const currentLoc = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = currentLoc.coords;

            if (mapReady && mapRef.current) {
                mapRef.current.animateToRegion({
                    latitude,
                    longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }, 1000);
            }

            setLocation({ latitude, longitude });
            reverseGeocode(latitude, longitude);
        } catch (error) {
            console.warn('Error recentering:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            // Add delay to ensure map is ready before recentering
            if (mapReady) {
                setTimeout(() => {
                    recenterToUser();
                }, 300);
            }
        }, [mapReady]),
    );

    const handleConfirm = () => {
        if (address) {
            navigation.replace(returnScreen, {
                selectedAddress: address,
                formData: formData,
            });
        } else {
            alert('Please select a location');
        }
    };

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                showsUserLocation={true}
                showsMyLocationButton={false}
                followsUserLocation={false}
                scrollEnabled={true}
                zoomEnabled={true}
                pitchEnabled={true}
                rotateEnabled={true}
                mapType="standard" // Options: 'standard', 'satellite', 'hybrid', 'terrain'
                onMapReady={handleMapReady}
                initialRegion={{
                    latitude: location?.latitude || 31.5204,
                    longitude: location?.longitude || 74.3587,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
                onPress={handleMapPress}
                // Google Maps specific props
                showsTraffic={false}
                showsBuildings={true}
                showsIndoors={true}
                loadingEnabled={true}
                loadingIndicatorColor="#666666"
                loadingBackgroundColor="#eeeeee"
            >
                {location && (
                    <Marker
                        coordinate={location}
                        title="Selected Location"
                        description="Tap to confirm this location"
                        pinColor="red"
                        draggable={true}
                        onDragEnd={(e) => {
                            const { latitude, longitude } = e.nativeEvent.coordinate;
                            setLocation({ latitude, longitude });
                            reverseGeocode(latitude, longitude);
                        }}
                    />
                )}
            </MapView>

            {/* Loading indicator for map */}
            {!mapReady && (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading Map...</Text>
                </View>
            )}

            {/* Recenter Button */}
            <TouchableOpacity style={styles.recenterBtn} onPress={recenterToUser}>
                <Ionicons name="navigate" size={24} color="#fff" />
            </TouchableOpacity>

            {/* Map Type Toggle Button (Optional) */}
            <TouchableOpacity
                style={styles.mapTypeBtn}
                onPress={() => {
                    // You can add map type toggle functionality here
                    console.log('Map type toggle');
                }}
            >
                <Ionicons name="layers" size={20} color="#fff" />
            </TouchableOpacity>

            {/* Confirm Button */}
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
                <Text style={styles.confirmText}>Confirm Address</Text>
            </TouchableOpacity>

            {/* Address Preview */}
            {address && (
                <View style={styles.addressBox}>
                    <Text style={styles.addressTitle}>Selected Location</Text>
                    <Text style={styles.addressText} numberOfLines={3}>
                        {address}
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    loadingContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -75 }, { translateY: -25 }],
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 20,
        borderRadius: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        width: 150,
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    confirmBtn: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        backgroundColor: '#22c55e',
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    confirmText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    recenterBtn: {
        position: 'absolute',
        bottom: 110,
        right: 20,
        backgroundColor: '#007bff',
        padding: 12,
        borderRadius: 50,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    mapTypeBtn: {
        position: 'absolute',
        bottom: 170,
        right: 20,
        backgroundColor: '#666',
        padding: 10,
        borderRadius: 50,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    addressBox: {
        position: 'absolute',
        bottom: 180,
        left: 10,
        right: 10,
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        maxHeight: 100,
    },
    addressTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
        marginBottom: 5,
    },
    addressText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 18,
    },
});