import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { Feather } from '@expo/vector-icons';

const deals = [
    {
        id: '1',
        name: 'Surf Excel Easy Wash Detergent Power',
        qty: '500 ml',
        price: '$12',
        mrp: '$14',
        image: require('../assets/cat1.png'),
    },
    {
        id: '2',
        name: 'Fortune Arhar Dal (Toor Dal)',
        qty: '1 kg',
        price: '$10',
        mrp: '$12',
        image: require('../assets/cat1.png'),
    },
    {
        id: '3',
        name: 'Surf Excel Easy Wash Detergent Power',
        qty: '500 ml',
        price: '$12',
        mrp: '$14',
        image: require('../assets/cat1.png'),
    },
    {
        id: '4',
        name: 'Fortune Arhar Dal (Toor Dal)',
        qty: '1 kg',
        price: '$10',
        mrp: '$12',
        image: require('../assets/cat1.png'),
    },
    {
        id: '5',
        name: 'Surf Excel Easy Wash Detergent Power',
        qty: '500 ml',
        price: '$12',
        mrp: '$14',
        image: require('../assets/cat1.png'),
    },
    {
        id: '6',
        name: 'Fortune Arhar Dal (Toor Dal)',
        qty: '1 kg',
        price: '$10',
        mrp: '$12',
        image: require('../assets/cat1.png'),
    },
    // Add more items...
];

const BestDealScreen = ({ navigation }) => {
    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Image source={item.image} style={styles.image} />
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.qty}>{item.qty}</Text>
            <View style={styles.row}>
                <Text style={styles.old}>{item.mrp}</Text>
                <Text style={styles.price}>{item.price}</Text>
            </View>
            <TouchableOpacity style={styles.addBtn}>
                <Text style={styles.addText}>Add</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Feather name="chevron-left" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Best Deal</Text>
                <Feather name="search" size={20} />
            </View>

            <FlatList
                data={deals}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                numColumns={2}
                contentContainerStyle={{ padding: 10 }}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
    },
    headerTitle: { fontWeight: 'bold', fontSize: 16 },
    card: {
        backgroundColor: '#fff',
        width: '48%',
        marginBottom: 15,
        borderRadius: 15,
        padding: 10,
        elevation: 2,
    },
    image: { width: '100%', height: 100, resizeMode: 'contain', marginBottom: 10 },
    title: { fontSize: 14, fontWeight: '600' },
    qty: { fontSize: 12, color: '#777' },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 },
    old: { color: '#aaa', textDecorationLine: 'line-through', fontSize: 12 },
    price: { color: '#00C851', fontWeight: 'bold' },
    addBtn: {
        backgroundColor: '#00C851',
        paddingVertical: 6,
        borderRadius: 10,
        marginTop: 5,
    },
    addText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
});

export default BestDealScreen;
