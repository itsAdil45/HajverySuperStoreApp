import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    Image,
    TouchableOpacity,
    FlatList,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons'; // or react-native-vector-icons

const categories = [
    { id: '1', title: 'Vegetables & Fruits', icon: require('../assets/cat1.png') },
    { id: '2', title: 'Dairy & Breakfast', icon: require('../assets/cat1.png') },
    { id: '3', title: 'Cold Drinks & Juices', icon: require('../assets/cat1.png') },
    { id: '4', title: 'Instant & Frozen Food', icon: require('../assets/cat1.png') },
    { id: '5', title: 'Tea & Coffee', icon: require('../assets/cat1.png') },
    { id: '6', title: 'Atta, Rice & Dal', icon: require('../assets/cat1.png') },
    { id: '7', title: 'Masala, Oil & Dry Fruits', icon: require('../assets/cat1.png') },
    { id: '8', title: 'Chicken, Meat & Fish', icon: require('../assets/cat1.png') },
];

const bestDeals = [
    {
        id: '1',
        title: 'Surf Excel Easy Wash Detergent Power',
        qty: '500 ml',
        price: '$12',
        mrp: '$14',
        image: require('../assets/cat1.png'),
    },
    {
        id: '2',
        title: 'Fortune Arhar Dal (Toor Dal)',
        qty: '1 kg',
        price: '$10',
        mrp: '$12',
        image: require('../assets/cat1.png'),
    },
];

const Home = ({ navigation }) => {
    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.locationTitle}>Home</Text>
                    <Text style={styles.locationText}>6391 Elgin St. Celina, Delaware 10299</Text>
                </View>
                <Feather name="shopping-cart" size={22} color="#000" />
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Feather name="search" size={18} color="#aaa" />
                    <TextInput placeholder="Search" style={styles.searchInput} />
                </View>
                <TouchableOpacity style={styles.filterBtn}>
                    <Ionicons name="options-outline" size={18} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Shop by Category */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Shop By Category</Text>
                <TouchableOpacity onPress={() => navigation.navigate("CategoryTab")}>
                    <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
                {categories.map(cat => (
                    <TouchableOpacity key={cat.id} style={styles.categoryItem} onPress={() => navigation.navigate("CategoryTab")}>
                        <Image source={cat.icon} style={styles.categoryIcon} />
                        <Text style={styles.categoryText}>{cat.title}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Banner */}
            <View style={styles.banner}>
                <Text style={styles.bannerTitle}>World Food Festival,{"\n"}Bring the world to your Kitchen!</Text>
                <TouchableOpacity style={styles.shopNowBtn}>
                    <Text style={styles.shopNowText}>Shop Now</Text>
                </TouchableOpacity>
                <Image source={require('../assets/cat1.png')} style={styles.bannerImage} />
            </View>

            {/* Best Deal */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Best Deal</Text>
                <TouchableOpacity>
                    <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={bestDeals}
                keyExtractor={item => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingLeft: 15 }}
                renderItem={({ item }) => (
                    <View style={styles.dealCard}>
                        <Image source={item.image} style={styles.dealImage} />
                        <Text style={styles.dealTitle}>{item.title}</Text>
                        <Text style={styles.dealQty}>{item.qty}</Text>
                        <View style={styles.priceRow}>
                            <Text style={styles.oldPrice}>{item.mrp}</Text>
                            <Text style={styles.newPrice}>{item.price}</Text>
                        </View>
                        <TouchableOpacity style={styles.addBtn}>
                            <Text style={styles.addBtnText}>Add</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
        </ScrollView >
    );
};

const styles = StyleSheet.create({
    container: { backgroundColor: '#fff', flex: 1 },
    header: {
        padding: 35,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    locationTitle: { fontSize: 16, fontWeight: 'bold' },
    locationText: { fontSize: 12, color: '#888' },

    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        alignItems: 'center',
        marginBottom: 10,
    },
    searchBox: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#F5F5F5',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    searchInput: {
        marginLeft: 10,
        flex: 1,
        fontSize: 14,
    },
    filterBtn: {
        backgroundColor: '#00C851',
        padding: 10,
        borderRadius: 10,
        marginLeft: 10,
    },

    sectionHeader: {
        paddingHorizontal: 15,
        paddingTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    sectionTitle: { fontWeight: 'bold', fontSize: 16 },
    seeAll: { color: '#00C851', fontSize: 12 },

    categoryRow: {
        paddingVertical: 10,
        paddingLeft: 15,
    },
    categoryItem: {
        marginRight: 15,
        alignItems: 'center',
        width: 80,
    },
    categoryIcon: {
        width: 60,
        height: 60,
        borderRadius: 15,
        marginBottom: 5,
    },
    categoryText: {
        fontSize: 12,
        textAlign: 'center',
    },

    banner: {
        margin: 15,
        backgroundColor: '#E6F9EC',
        borderRadius: 20,
        padding: 15,
        position: 'relative',
    },
    bannerTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#000',
        marginBottom: 10,
    },
    shopNowBtn: {
        backgroundColor: '#00C851',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 10,
        alignSelf: 'flex-start',
    },
    shopNowText: { color: '#fff', fontWeight: 'bold' },
    bannerImage: {
        position: 'absolute',
        right: 10,
        bottom: 0,
        width: 100,
        height: 100,
        resizeMode: 'contain',
    },

    dealCard: {
        backgroundColor: '#fff',
        width: 160,
        marginRight: 15,
        borderRadius: 15,
        padding: 10,
        elevation: 2,
    },
    dealImage: {
        width: '100%',
        height: 100,
        resizeMode: 'contain',
        marginBottom: 10,
    },
    dealTitle: {
        fontSize: 14,
        fontWeight: '600',
    },
    dealQty: {
        fontSize: 12,
        color: '#777',
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 5,
    },
    oldPrice: {
        color: '#aaa',
        textDecorationLine: 'line-through',
        fontSize: 12,
    },
    newPrice: {
        color: '#00C851',
        fontWeight: 'bold',
    },
    addBtn: {
        backgroundColor: '#00C851',
        paddingVertical: 6,
        borderRadius: 10,
        marginTop: 5,
    },
    addBtnText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: '600',
    },
});

export default Home;
