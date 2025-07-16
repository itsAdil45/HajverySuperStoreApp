import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function PaymentScreen({ navigation }) {
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [receiptImage, setReceiptImage] = useState(null);
    const totalAmount = 2200; // Example total

    const selectImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            return Alert.alert("Permission Denied", "You need to allow access to upload receipt.");
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        });

        if (!result.cancelled) {
            setReceiptImage(result.assets[0].uri);
        }
    };

    const placeOrder = () => {
        if (!selectedMethod) {
            return Alert.alert("Select Payment Method", "Please choose a payment method.");
        }

        if (selectedMethod === 'online' && !receiptImage) {
            return Alert.alert("Upload Receipt", "Receipt is required for online payment.");
        }

        // TODO: Upload image to Cloudinary & send order to backend

        Alert.alert("Order Placed", `Payment method: ${selectedMethod.toUpperCase()}`);
        navigation.navigate('Home'); // or Orders
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.heading}>Total Amount: Rs {totalAmount}</Text>

            <Text style={styles.label}>Select Payment Method</Text>
            <TouchableOpacity
                style={[styles.option, selectedMethod === 'cod' && styles.selected]}
                onPress={() => setSelectedMethod('cod')}
            >
                <Text style={styles.optionText}>Cash on Delivery</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.option, selectedMethod === 'online' && styles.selected]}
                onPress={() => setSelectedMethod('online')}
            >
                <Text style={styles.optionText}>Online Payment</Text>
            </TouchableOpacity>

            {selectedMethod === 'online' && (
                <View style={styles.onlineSection}>
                    <Text style={styles.bankTitle}>Send Payment To:</Text>
                    <Text>Easypaisa: 02288028</Text>
                    <Text>JazzCash: 0311-1234567</Text>
                    <Text>Bank Account: 1234567890 (HBL)</Text>

                    <TouchableOpacity style={styles.uploadBtn} onPress={selectImage}>
                        <Text style={styles.uploadText}>
                            {receiptImage ? 'Change Receipt' : 'Upload Receipt Screenshot'}
                        </Text>
                    </TouchableOpacity>

                    {receiptImage && (
                        <Image
                            source={{ uri: receiptImage }}
                            style={{ width: '100%', height: 200, marginTop: 10, borderRadius: 8 }}
                            resizeMode="contain"
                        />
                    )}

                </View>
            )}
            <TouchableOpacity style={styles.placeBtn} onPress={placeOrder}>
                <Text style={styles.placeText}>Place Order</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#fff" },
    heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
    label: { fontSize: 16, marginBottom: 10 },
    option: {
        padding: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        marginBottom: 10,
    },
    selected: {
        borderColor: '#22c55e',
        backgroundColor: '#e7fbe9',
    },
    optionText: { fontSize: 16 },
    onlineSection: {
        marginTop: 20,
        backgroundColor: '#f9f9f9',
        padding: 15,
        borderRadius: 10,
    },
    bankTitle: { fontWeight: 'bold', marginBottom: 10 },
    uploadBtn: {
        backgroundColor: '#22c55e',
        padding: 12,
        borderRadius: 6,
        marginTop: 15,
        alignItems: 'center',
    },
    uploadText: { color: '#fff', fontWeight: 'bold' },
    placeBtn: {
        marginVertical: 30,
        backgroundColor: '#22c55e',
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
    },
    placeText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
