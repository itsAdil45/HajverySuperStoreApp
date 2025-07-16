import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { MessageSquare, Phone } from 'lucide-react-native';

const ordersData = [
    {
        id: '27890765356',
        date: '10 Apr 2023 at 07:45 PM',
        address: '4517 Washington Ave...',
        itemsCount: 10,
        amount: '$22',
        status: 'Received',
        type: 'Previous',
        image: require('../assets/cat1.png'),
    },
    {
        id: '89012399098',
        date: '10 Apr 2023 at 07:45 PM',
        address: '4517 Washington Ave...',
        itemsCount: 15,
        amount: '$50',
        status: 'Received',
        type: 'Previous',
        image: require('../assets/cat1.png'),
    },
    {
        id: '33098890165',
        date: '10 Apr 2023 at 07:45 PM',
        address: '4517 Washington Ave...',
        itemsCount: 5,
        amount: '$45',
        status: 'Processing',
        type: 'Previous',
        image: require('../assets/cat1.png'),
    },
    {
        id: '44098890166',
        date: '11 Apr 2023 at 09:30 AM',
        address: '1234 Main Street...',
        itemsCount: 8,
        amount: '$35',
        status: 'Confirmed',
        type: 'Previous',
        image: require('../assets/cat1.png'),
    },
];

export default function OrderScreen() {
    const [selectedTab, setSelectedTab] = useState('Upcoming');

    // Filter orders based on selected tab
    const filteredOrders = ordersData.filter(order => order.type === selectedTab);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>My Order</Text>

            {/* Tabs */}
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tabBtn, styles.tabLeft, selectedTab === 'Previous' && styles.tabActive]}
                    onPress={() => setSelectedTab('Previous')}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.tabText, selectedTab === 'Previous' && styles.tabTextActive]}>
                        Previous
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabBtn, styles.tabRight, selectedTab === 'Upcoming' && styles.tabActive]}
                    onPress={() => setSelectedTab('Upcoming')}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.tabText, selectedTab === 'Upcoming' && styles.tabTextActive]}>
                        Upcoming
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Orders List */}
            <FlatList
                data={filteredOrders}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.listContainer}
                style={styles.listStyle}
                renderItem={({ item }) => (
                    <View style={styles.orderCard}>
                        <View style={styles.orderHeader}>
                            <Image source={item.image} style={styles.image} />
                            <View style={styles.orderInfo}>
                                <Text style={styles.orderId}>#{item.id}</Text>
                                <Text style={styles.address}>{item.address}</Text>
                                <Text style={styles.itemCount}>{item.itemsCount} items</Text>
                            </View>
                            <View style={styles.statusTag}>
                                <Text style={styles.statusText}>{item.status}</Text>
                            </View>
                        </View>

                        <Text style={styles.date}>{item.date}</Text>

                        <View style={styles.footerRow}>
                            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
                                <MessageSquare size={20} color="#22c55e" />
                                <Text style={styles.iconText}>Message</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
                                <Phone size={20} color="#22c55e" />
                                <Text style={styles.iconText}>Call</Text>
                            </TouchableOpacity>
                            <Text style={styles.amount}>{item.amount}</Text>
                        </View>
                    </View>
                )}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No {selectedTab.toLowerCase()} orders found</Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff'
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    tabs: {
        flexDirection: 'row',
        marginBottom: 16,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 2,
    },
    tabBtn: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 6,
    },
    tabLeft: {
        marginRight: 1,
    },
    tabRight: {
        marginLeft: 1,
    },
    tabActive: {
        backgroundColor: '#22c55e',
    },
    tabText: {
        color: '#666',
        fontWeight: '600',
    },
    tabTextActive: {
        color: '#fff',
    },
    listStyle: {
        flex: 1,
    },
    listContainer: {
        paddingBottom: 30,
        flexGrow: 1,
    },
    orderCard: {
        backgroundColor: '#f9f9f9',
        padding: 12,
        borderRadius: 10,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    orderHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 6,
    },
    orderInfo: {
        marginLeft: 10,
        flex: 1,
    },
    orderId: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    address: {
        color: '#777',
        fontSize: 13,
    },
    itemCount: {
        color: '#777',
        fontSize: 13,
    },
    statusTag: {
        backgroundColor: '#e7fce9',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    statusText: {
        color: '#22c55e',
        fontSize: 12,
        fontWeight: '600',
    },
    date: {
        marginTop: 6,
        color: '#888',
        fontSize: 13,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
    },
    iconBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e7fce9',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    iconText: {
        marginLeft: 6,
        color: '#22c55e',
        fontWeight: '600',
    },
    amount: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});