import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ScrollView
} from 'react-native';
import { Feather } from '@expo/vector-icons';

// Dummy categories and products
const subcategories = [
    'Atta',
    'Besan & Maida',
    'Sooji',
    'Rice',
    'Poha & Daliya',
    'Toor, Urad & Chana',
    'Aatta',
    'Beasan & Maida',
    'Soaoji',
    'Raice',
    'Paoha & Daliya',
    'Tooar, Urad & Chana',
    'Aastta',
    'Bseasan & Maida',
    'Soaosji',
    'Raicse',
    'Paohas & Daliya',
    'Tsooar, Urad & Chana',
];

const allProducts = {
    'Atta': [
        {
            id: '1',
            name: 'Aashirvaad Shudh Atta',
            weight: '10 kg',
            price: '$12',
            mrp: '$14',
            image: require('../assets/cat1.png'),
        },
        {
            id: '254',
            name: 'Fresh Ultimate Atta',
            weight: '5 kg',
            price: '$7',
            mrp: '$10',
            image: require('../assets/cat1.png'),
        },
        {
            id: '39',
            name: 'Fortune Fresh Atta',
            weight: '5 kg',
            price: '$5',
            mrp: '$8',
            image: require('../assets/cat1.png'),
        },
        {
            id: '112',
            name: 'Aashirvaad Shudh Atta',
            weight: '10 kg',
            price: '$12',
            mrp: '$14',
            image: require('../assets/cat1.png'),
        },
        {
            id: '24',
            name: 'Fresh Ultimate Atta',
            weight: '5 kg',
            price: '$7',
            mrp: '$10',
            image: require('../assets/cat1.png'),
        },
        {
            id: '31',
            name: 'Fortune Fresh Atta',
            weight: '5 kg',
            price: '$5',
            mrp: '$8',
            image: require('../assets/cat1.png'),
        },
        {
            id: '19',
            name: 'Aashirvaad Shudh Atta',
            weight: '10 kg',
            price: '$12',
            mrp: '$14',
            image: require('../assets/cat1.png'),
        },
        {
            id: '25',
            name: 'Fresh Ultimate Atta',
            weight: '5 kg',
            price: '$7',
            mrp: '$10',
            image: require('../assets/cat1.png'),
        },
        {
            id: '12',
            name: 'Fortune Fresh Atta',
            weight: '5 kg',
            price: '$5',
            mrp: '$8',
            image: require('../assets/cat1.png'),
        },
    ],
    'Besan & Maida': [],
    'Sooji': [],
    'Rice': [],
    'Poha & Daliya': [],
    'Toor, Urad & Chana': [],
    'Bsesan & Maida': [],
    'Ssooji': [],
    'Risce': [],
    'Psoha & Daliya': [],
    'Tosor, Urad & Chana': [],
};

const CategoryProductsScreen = ({ navigation }) => {
    const [selectedSubcat, setSelectedSubcat] = useState(subcategories[0]);

    const renderProduct = ({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("Product")}>
            <Image source={item.image} style={styles.image} />
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.qty}>{item.weight}</Text>
            <View style={styles.priceRow}>
                <Text style={styles.mrp}>{item.mrp}</Text>
                <Text style={styles.price}>{item.price}</Text>
            </View>
            <TouchableOpacity style={styles.addButton}>
                <Text style={styles.addText}>Add</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Feather name="chevron-left" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Atta, Rice & Dal</Text>
                <Feather name="search" size={20} />
            </View>

            <View style={styles.body}>
                {/* Left Subcategory List */}
                <FlatList
                    data={subcategories}
                    keyExtractor={item => item}
                    style={styles.sidebar}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (

                        <TouchableOpacity
                            onPress={() => setSelectedSubcat(item)}
                            style={[
                                styles.sidebarItem,
                                selectedSubcat === item && styles.activeSidebarItem,
                                { width: 100 }
                            ]}
                        >
                            <Text
                                style={[
                                    styles.sidebarText,
                                    selectedSubcat === item && styles.activeSidebarText,
                                ]}
                            >
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                />

                {/* Right Product Grid */}
                <View style={{ flex: 1 }}>
                    <FlatList
                        data={allProducts[selectedSubcat] || []}
                        keyExtractor={item => item.id}
                        renderItem={renderProduct}
                        numColumns={2}
                        contentContainerStyle={styles.productList}
                        columnWrapperStyle={{ justifyContent: 'space-between' }}
                        showsVerticalScrollIndicator={true}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>No items in this category</Text>
                        }
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: { fontWeight: 'bold', fontSize: 16 },

    body: { flex: 1, flexDirection: 'row' },
    sidebar: {
        borderRightWidth: 1,
        borderRightColor: '#eee',
        paddingVertical: 10,
        flexGrow: 0
    },
    sidebarItem: {
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderLeftWidth: 3,
        borderLeftColor: 'transparent',
    },
    activeSidebarItem: {
        borderLeftColor: '#00C851',
        backgroundColor: '#F1FFF2',
    },
    sidebarText: {
        fontSize: 12,
        color: '#444',
    },
    activeSidebarText: {
        fontWeight: 'bold',
        color: '#00C851',
    },

    productList: {
        padding: 10,
        flexGrow: 1,
    },
    card: {
        backgroundColor: '#fff',
        width: '48%',
        marginBottom: 15,
        borderRadius: 12,
        padding: 10,
        elevation: 1,
    },
    image: {
        width: '100%',
        height: 100,
        resizeMode: 'contain',
        marginBottom: 8,
    },
    name: { fontSize: 13, fontWeight: '600' },
    qty: { fontSize: 12, color: '#777' },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 5,
    },
    mrp: {
        fontSize: 12,
        textDecorationLine: 'line-through',
        color: '#aaa',
    },
    price: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#00C851',
    },
    addButton: {
        backgroundColor: '#00C851',
        paddingVertical: 6,
        borderRadius: 8,
    },
    addText: {
        textAlign: 'center',
        color: '#fff',
        fontWeight: '600',
    },
    emptyText: {
        textAlign: 'center',
        color: '#aaa',
        fontStyle: 'italic',
        marginTop: 30,
    },
});

export default CategoryProductsScreen;
