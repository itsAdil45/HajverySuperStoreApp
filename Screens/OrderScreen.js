import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Image,
    ActivityIndicator,
    Alert,
    StyleSheet
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

import useGet from '../hooks/useGet';
import appColors from '../colors/appColors';

export default function OrderScreen({ navigation }) {
    const [selectedTab, setSelectedTab] = useState('All');

    // Fetch all orders
    const { data: orders, loading, error, refetch } = useGet('/orders/my/orders');

    const handleBack = () => {
        navigation?.goBack();
    };

    const handleOrderPress = (orderId) => {
        // Navigate to order details screen
        console.log("Navigating to OrderDetail with ID:", orderId);
        navigation.navigate('OrderDetail', { orderId });
    };

    // Filter orders based on selected tab and status
    const filteredOrders = orders ? orders.filter(order => {
        if (selectedTab === 'All') return true;
        if (selectedTab === 'Pending') return order.status === 'pending';
        if (selectedTab === 'Processing') return order.status === 'processing';
        if (selectedTab === 'Completed') return order.status === 'completed';
        return true;
    }) : [];

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#f59e0b';
            case 'processing': return '#3b82f6';
            case 'completed': return '#10b981';
            default: return '#6b7280';
        }
    };

    const getStatusText = (status) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    const calculateTotalItems = (items) => {
        return items.reduce((total, item) => total + item.quantity, 0);
    };

    // Helper function to get display name for an item
    const getItemDisplayName = (item) => {
        if (item.itemType === 'deal') {
            return item.deal?.title || 'Deal Item';
        } else {
            return item.product?.name || 'Product';
        }
    };

    // Helper function to format items preview with both products and deals
    const formatItemsPreview = (items) => {
        const previewItems = items.slice(0, 2).map((item) => {
            const displayName = getItemDisplayName(item);
            return `${displayName} (${item.quantity}x)`;
        }).join(', ');

        return items.length > 2
            ? `${previewItems} +${items.length - 2} more`
            : previewItems;
    };

    const renderOrderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.orderCard}
            onPress={() => handleOrderPress(item._id)}
            activeOpacity={0.7}
        >
            <View style={styles.orderHeader}>
                <View style={styles.orderIconContainer}>
                    <Feather name='package' size={24} color="#6b7280" />
                </View>
                <View style={styles.orderInfo}>
                    <Text style={styles.orderId}>#{item._id.slice(-8).toUpperCase()}</Text>
                    <View style={styles.orderMeta}>
                        <Ionicons name='calendar-sharp' size={14} color="#6b7280" />
                        <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
                    </View>
                    <Text style={styles.itemCount}>
                        {calculateTotalItems(item.items)} items • {item.paymentMethod.toUpperCase()}
                    </Text>
                </View>
                <View style={[styles.statusTag, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {getStatusText(item.status)}
                    </Text>
                </View>
            </View>

            <View style={styles.orderDetails}>
                <Text style={styles.itemsPreview}>
                    {formatItemsPreview(item.items)}
                </Text>
            </View>

            <View style={styles.footerRow}>
                <View style={styles.priceBreakdown}>
                    <Text style={styles.subtotal}>Subtotal: Rs {item.subtotal}</Text>
                    {item.charges.total > 0 && (
                        <Text style={styles.charges}>Charges: Rs {item.charges.total}</Text>
                    )}
                </View>
                <Text style={styles.totalAmount}>Rs {item.total}</Text>
            </View>

            {(item.status === 'processing' || item.status === 'completed') && (
                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
                        <Feather name='message-square' size={16} color={appColors.Hover_Button} />
                        <Text style={styles.actionText}>Message</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
                        <Feather name='phone' size={16} color={appColors.Hover_Button} />
                        <Text style={styles.actionText}>Call</Text>
                    </TouchableOpacity>
                </View>
            )}
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
                        <Feather name='arrow-left' size={20} color="#1f2937" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Orders</Text>
                    <View style={styles.headerSpacer} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={appColors.darkerBg} />
                    <Text style={styles.loadingText}>Loading orders...</Text>
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
                        <Feather name='arrow-left' size={20} color="#1f2937" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Orders</Text>
                    <View style={styles.headerSpacer} />
                </View>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={refetch} activeOpacity={0.7}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
                    <Feather name='arrow-left' size={20} color="#1f2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Orders</Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <View style={styles.tabs}>
                    {['All', 'Pending', 'Processing', 'Completed'].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[
                                styles.tabBtn,
                                selectedTab === tab && styles.tabActive
                            ]}
                            onPress={() => setSelectedTab(tab)}
                            activeOpacity={0.7}
                        >
                            <Text style={[
                                styles.tabText,
                                selectedTab === tab && styles.tabTextActive
                            ]}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Orders List */}
            <FlatList
                data={filteredOrders}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
                style={styles.listStyle}
                renderItem={renderOrderItem}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Feather name='package' size={48} color="#9ca3af" />
                        <Text style={styles.emptyTitle}>No {selectedTab.toLowerCase()} orders</Text>
                        <Text style={styles.emptySubtitle}>
                            {selectedTab === 'All'
                                ? "You haven't placed any orders yet"
                                : `No ${selectedTab.toLowerCase()} orders found`
                            }
                        </Text>
                    </View>
                )}
                refreshing={loading}
                onRefresh={refetch}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 40,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    backBtn: {
        padding: 8,
        borderRadius: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
        marginLeft: 12,
    },
    headerSpacer: {
        flex: 1,
    },
    tabsContainer: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    tabBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
    },
    tabActive: {
        backgroundColor: appColors.Primary_Button,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6b7280',
    },
    tabTextActive: {
        color: '#fff',
    },
    listContainer: {
        padding: 16,
    },
    listStyle: {
        flex: 1,
    },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    orderHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    orderIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    orderInfo: {
        flex: 1,
    },
    orderId: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 4,
    },
    orderMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    date: {
        fontSize: 12,
        color: '#6b7280',
        marginLeft: 4,
    },
    itemCount: {
        fontSize: 12,
        color: '#6b7280',
    },
    statusTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
    },
    orderDetails: {
        marginBottom: 12,
    },
    itemsPreview: {
        fontSize: 14,
        color: '#4b5563',
        lineHeight: 20,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 8,
    },
    priceBreakdown: {
        flex: 1,
    },
    subtotal: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 2,
    },
    charges: {
        fontSize: 12,
        color: '#6b7280',
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        paddingTop: 12,
        marginTop: 4,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 12,
    },
    actionText: {
        fontSize: 12,
        color: appColors.Hover_Button,
        fontWeight: '500',
        marginLeft: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 8,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    errorText: {
        fontSize: 14,
        color: '#ef4444',
        textAlign: 'center',
        marginBottom: 16,
    },
    retryBtn: {
        backgroundColor: '#22c55e',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryText: {
        color: '#fff',
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 48,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
    },
});