import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Linking, Platform } from 'react-native';

export default function LocationPickerScreen({ navigation }) {
    const [location, setLocation] = useState(null);
    const [address, setAddress] = useState(null);
    const mapRef = useRef(null);
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
            }
        })();
    }, []);


    const reverseGeocode = async (lat, lon) => {
        try {
            const result = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
            if (result.length > 0) {
                const a = result[0];
                setAddress(`${a.formattedAddress || ''}`);
            }
        } catch (error) {
            console.warn('Reverse geocoding failed:', error);
        }
    };

    const handleMapPress = (e) => {
        const { latitude, longitude } = e.nativeEvent.coordinate;
        setLocation({ latitude, longitude });
        reverseGeocode(latitude, longitude);
    };

    const recenterToUser = async () => {
        try {
            const currentLoc = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = currentLoc.coords;

            mapRef.current?.animateToRegion({
                latitude,
                longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            });

            setLocation({ latitude, longitude });
            reverseGeocode(latitude, longitude);
        } catch (error) {
            console.warn('Error recentering:', error);
        }
    };
    useFocusEffect(
        useCallback(() => {
            recenterToUser()
        }, []),
    );
    const handleConfirm = () => {
        if (address) {
            console.log(address);
            // navigation.navigate('CheckoutScreen', {
            //     newAddress: { type: 'Custom', address },
            // });
        } else {
            alert('Please select a location');
        }
    };

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={undefined}
                showsUserLocation
                showsMyLocationButton={false}
                initialRegion={{
                    latitude: location?.latitude || 31.5204,
                    longitude: location?.longitude || 74.3587,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
                onPress={handleMapPress}
            >
                <UrlTile urlTemplate="http://c.tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} />
                {location && <Marker coordinate={location} />}
            </MapView>

            {/* Recenter Button */}
            <TouchableOpacity style={styles.recenterBtn} onPress={recenterToUser}>
                <Ionicons name="navigate" size={24} color="#fff" />
            </TouchableOpacity>

            {/* Confirm Button */}
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Confirm Address</Text>
            </TouchableOpacity>

            {/* Address Preview */}
            {address && (
                <View style={styles.addressBox}>
                    <Text style={{ fontWeight: 'bold' }}>Select Location</Text>
                    <Text>{address}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
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
    },
    recenterBtn: {
        position: 'absolute',
        bottom: 110,
        right: 20,
        backgroundColor: '#007bff',
        padding: 12,
        borderRadius: 50,
        elevation: 5,
    },
    addressBox: {
        position: 'absolute',
        bottom: 180,
        left: 10,
        right: 10,
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 8,
        elevation: 5,
    },
});
