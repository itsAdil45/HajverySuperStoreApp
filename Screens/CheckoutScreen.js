import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    FlatList,
    Modal
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const cartItems = [
    {
        id: '1',
        title: 'Fortune Sun Lite Refined Sunflower Oil',
        size: '5 L',
        price: 12,
        image: require('../assets/cat1.png'),
        quantity: 1,
    },
    {
        id: '2',
        title: 'Aashirvaad Shudh Aata',
        size: '10 kg',
        price: 12,
        image: require('../assets/cat1.png'),
        quantity: 1,
    },
];

const recommendations = [
    {
        id: '3',
        title: 'Surf Excel Easy Wash Detergent Power',
        size: '500 ml',
        price: 12,
        oldPrice: 14,
        image: require('../assets/cat1.png'),
    },
    {
        id: '4',
        title: 'Fortune Arhar Dal (Toor Dal)',
        size: '1 kg',
        price: 10,
        oldPrice: 12,
        image: require('../assets/cat1.png'),
    },
    {
        id: '453',
        title: 'Surf Excel Easy Wash Detergent Power',
        size: '500 ml',
        price: 12,
        oldPrice: 14,
        image: require('../assets/cat1.png'),
    },
    {
        id: '14',
        title: 'Fortune Arhar Dal (Toor Dal)',
        size: '1 kg',
        price: 10,
        oldPrice: 12,
        image: require('../assets/cat1.png'),
    },
];

export default function CheckoutScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const [selectedAddress, setSelectedAddress] = useState({
        type: 'Home',
        address: '6391 Elgin St. Celina, Delaware',
    });
    const [savedAddresses, setSavedAddresses] = useState([
        { id: '1', type: 'Home', address: '6391 Elgin St. Celina, Delaware' },
        { id: '2', type: 'Work', address: '1125 Walnut St. Springfield, IL' },
    ]);
    const [modalVisible, setModalVisible] = useState(false);
    useEffect(() => {
        if (route.params?.newAddress) {
            setSelectedAddress(route.params.newAddress);
            setSavedAddresses(prev => [...prev, route.params.newAddress]);
        }
    }, [route.params]);
    return (
        <ScrollView style={styles.container}>
            {/* <Text style={[styles.heading, { textAlign: "center" }]}>Checkout</Text> */}

            {/* Cart Items */}
            {cartItems.map(item => (
                <View style={styles.cartItem} key={item.id}>
                    <Image source={item.image} style={styles.cartImage} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.cartTitle}>{item.title}</Text>
                        <Text style={{ color: "#777" }}>{item.size}</Text>
                        <View style={{ display: "flex", flexDirection: 'row', justifyContent: 'space-between', alignItems: "center" }}>
                            <Text style={styles.cartPrice}>${item.price}</Text>

                            <View style={styles.qtyRow}>
                                <TouchableOpacity>
                                    <Text style={styles.qtyBtn}>-</Text>
                                </TouchableOpacity>
                                <Text style={styles.qtyText}>{item.quantity}</Text>
                                <TouchableOpacity>
                                    <Text style={styles.qtyBtn}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            ))}

            {/* Recommendation Section */}
            <Text style={styles.subheading}>Before you Checkout</Text>
            <FlatList
                horizontal
                data={recommendations}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.recommendCard}>
                        <Image source={item.image} style={styles.recommendImage} />
                        <Text numberOfLines={2} style={styles.recommendTitle}>{item.title}</Text>
                        <Text>{item.size}</Text>
                        <View style={styles.priceRow}>
                            <Text style={styles.recommendPrice}>${item.price}</Text>
                            <Text style={styles.recommendOldPrice}>${item.oldPrice}</Text>
                        </View>
                        <TouchableOpacity style={styles.addBtn}>
                            <Text style={styles.addBtnText}>Add</Text>
                        </TouchableOpacity>
                    </View>
                )}
                showsHorizontalScrollIndicator={false}
            />

            {/* Coupon Section */}
            <TouchableOpacity style={styles.couponRow}>
                <Text>🧾  APPLY COUPON</Text>
                <Text>{'>'}</Text>
            </TouchableOpacity>

            {/* Summary Section */}
            <View style={styles.summary}>
                <View style={{ display: "flex", flexDirection: 'row', justifyContent: "space-between", paddingHorizontal: 10 }}>
                    <Text style={styles.summaryText}>Item Total:</Text>
                    <Text style={styles.summaryText}>$24</Text>
                </View>

                <View style={{ display: "flex", flexDirection: 'row', justifyContent: "space-between", paddingHorizontal: 10 }}>
                    <Text style={styles.summaryText}>Discount:</Text>
                    <Text style={styles.summaryText}>$24</Text>
                </View>

                <View style={{ display: "flex", flexDirection: 'row', justifyContent: "space-between", paddingHorizontal: 10 }}>
                    <Text style={styles.summaryText}>Delivery:</Text>
                    <Text style={{ color: 'green' }}>Free</Text>
                </View>
                <Text style={styles.summaryTotal}>Grand Total: $22</Text>
            </View>

            {/* Address Section */}
            <View style={styles.addressRow}>
                <Text style={{ fontWeight: 'bold' }}>Delivering to {selectedAddress.type}</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Text style={{ color: '#53B175' }}>Change</Text>
                </TouchableOpacity>
            </View>
            <Text style={{ marginBottom: 10, color: "#777" }}>{selectedAddress.address}</Text>

            <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
                <View style={{ flex: 1, backgroundColor: 'white', padding: 20, paddingTop: 60 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 20 }}>Select an Address</Text>
                    {savedAddresses.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={{ paddingVertical: 12 }}
                            onPress={() => {
                                setSelectedAddress(item);
                                setModalVisible(false);
                            }}
                        >
                            <Text style={{ fontWeight: 'bold' }}>{item.type}</Text>
                            <Text style={{ color: '#777' }}>{item.address}</Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                        style={styles.addBtn}
                        onPress={() => {
                            setModalVisible(false);
                            navigation.navigate('LocationPickerScreen');
                        }}
                    >
                        <Text style={styles.addBtnText}>+ Add New Address</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            {/* Payment Info */}
            {/* <Text style={{ fontSize: 14, marginBottom: 8 }}>Pay Using</Text>
            <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Visa •••• 6589</Text> */}

            {/* Place Order Button */}
            <TouchableOpacity style={styles.checkoutBtn}>
                <Text style={styles.checkoutText}>$22   |   Place Order</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16, backgroundColor: "white" },
    heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    cartItem: { flexDirection: 'row', marginBottom: 16, backgroundColor: "#f9f9f9", padding: 10, borderRadius: 10 },
    cartImage: { width: 80, height: 80, marginRight: 12, borderRadius: 8 },
    cartTitle: { fontWeight: 'bold', fontSize: 16 },
    cartPrice: { color: 'green', marginTop: 4 },
    qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    qtyBtn: {
        fontSize: 20,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 4,
        backgroundColor: '#d1d5db'
    },
    qtyText: { marginHorizontal: 10, fontSize: 16 },
    subheading: { fontSize: 18, fontWeight: 'bold', marginVertical: 16 },
    recommendCard: {
        width: 140,
        backgroundColor: '#f9f9f9',
        padding: 8,
        borderRadius: 10,
        marginRight: 10
    },
    recommendImage: { width: '100%', height: 80, resizeMode: 'contain', marginBottom: 6 },
    recommendTitle: { fontSize: 13, fontWeight: '500' },
    recommendPrice: { color: 'green', fontWeight: 'bold' },
    recommendOldPrice: {
        textDecorationLine: 'line-through',
        color: 'gray',
        fontSize: 12,
        marginLeft: 5
    },
    priceRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
    addBtn: { backgroundColor: '#22c55e', padding: 14, borderRadius: 8, marginTop: 30, alignItems: 'center' },
    addBtnText: { color: 'white', fontWeight: 'bold' },
    couponRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#f3f4f6',
        padding: 12,
        borderRadius: 6,
        marginTop: 24,
        alignItems: 'center'
    },
    summary: { marginTop: 20, borderTopWidth: 1, paddingTop: 16, borderColor: '#ccc' },
    summaryText: { fontSize: 16, marginBottom: 18 },
    summaryTotal: { fontSize: 18, fontWeight: 'bold', marginTop: 8 },
    addressRow: {
        marginTop: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

    },
    checkoutBtn: {
        marginBottom: 30,
        backgroundColor: '#22c55e',
        padding: 16,
        borderRadius: 10,
        alignItems: 'center'
    },
    checkoutText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});
