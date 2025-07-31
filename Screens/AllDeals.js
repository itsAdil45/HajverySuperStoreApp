import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    StyleSheet,
    FlatList,
    RefreshControl,
} from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import useGet from '../hooks/useGet'; // Adjust import path as needed

const AllDeals = ({ navigation }) => {
    const { data: dealsData, loading: dealsLoading, error: dealsError, refetch } = useGet('/deals');
    const [deals, setDeals] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (dealsData && dealsData.deals) {
            setDeals(dealsData.deals);
        }
    }, [dealsData]);

    const formatPrice = (price) => {
        return `$${price.toFixed(2)}`;
    };

    const calculateSavings = (originalPrice, dealPrice) => {
        const savings = originalPrice - dealPrice;
        const percentage = Math.round((savings / originalPrice) * 100);
        return { savings: formatPrice(savings), percentage };
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    const renderDealCard = ({ item }) => {
        const dealProduct = item.products[0]?.product;
        const savings = calculateSavings(item.originalPrice, item.dealPrice);

        return (
            <TouchableOpacity
                style={styles.dealCard}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('DealDetails', { dealId: item._id })}
            >
                {/* Image with Badge */}
                <View style={styles.dealImageContainer}>
                    <Image
                        source={{ uri: item.bannerImage }}
                        style={styles.dealImage}
                        resizeMode="cover"
                    />
                    <View style={styles.dealBadge}>
                        <Text style={styles.dealBadgeText}>{savings.percentage}% OFF</Text>
                    </View>
                    <View style={styles.timeLeftBadge}>
                        <MaterialIcons name="access-time" size={12} color="#FF5722" />
                        <Text style={styles.timeLeftText}>
                            {new Date(item.validUntil).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                            })}
                        </Text>
                    </View>
                </View>

                {/* Deal Info */}
                <View style={styles.dealInfo}>
                    <Text style={styles.dealTitle} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.dealDescription} numberOfLines={2}>{item.description}</Text>

                    {/* Product Info */}
                    {dealProduct && (
                        <View style={styles.productInfo}>
                            <Text style={styles.productLabel}>Featured Product:</Text>
                            <Text style={styles.productName} numberOfLines={1}>{dealProduct.name}</Text>
                        </View>
                    )}

                    {/* Price Section */}
                    <View style={styles.priceSection}>
                        <View style={styles.priceRow}>
                            <Text style={styles.currentPrice}>{formatPrice(item.dealPrice)}</Text>
                            <Text style={styles.originalPrice}>{formatPrice(item.originalPrice)}</Text>
                        </View>
                        <View style={styles.savingsContainer}>
                            <Text style={styles.savingsText}>You Save {savings.savings}</Text>
                        </View>
                    </View>

                    {/* Products Count */}
                    <View style={styles.productsCount}>
                        <MaterialIcons name="inventory" size={16} color="#666" />
                        <Text style={styles.productsCountText}>
                            {item.products.length} product{item.products.length > 1 ? 's' : ''} included
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (dealsLoading && deals.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00C851" />
                <Text style={styles.loadingText}>Loading deals...</Text>
            </View>
        );
    }

    if (dealsError && deals.length === 0) {
        return (
            <View style={styles.errorContainer}>
                <MaterialIcons name="error-outline" size={48} color="#FF5252" />
                <Text style={styles.errorText}>Failed to load deals</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
                    <Text style={styles.retryText}>Try Again</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Feather name="arrow-left" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Hot Deals</Text>
                <View style={styles.headerRight}>
                    <MaterialIcons name="local-fire-department" size={24} color="#FF5722" />
                </View>
            </View>

            {/* Deals Count */}
            <View style={styles.dealsCountContainer}>
                <Text style={styles.dealsCountText}>
                    {deals.length} active deal{deals.length !== 1 ? 's' : ''} available
                </Text>
            </View>

            {/* Deals List */}
            {deals && deals.length > 0 ? (
                <FlatList
                    data={deals}
                    keyExtractor={item => item._id}
                    renderItem={renderDealCard}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#00C851']}
                        />
                    }
                />
            ) : (
                <View style={styles.noDealsContainer}>
                    <MaterialIcons name="local-offer" size={64} color="#ccc" />
                    <Text style={styles.noDealsTitle}>No Active Deals</Text>
                    <Text style={styles.noDealsText}>
                        Check back later for amazing deals and offers!
                    </Text>
                    <TouchableOpacity style={styles.browseProductsBtn} onPress={() => navigation.navigate('CategoryTab')}>
                        <Text style={styles.browseProductsText}>Browse Products</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        color: '#FF5252',
        marginVertical: 10,
        textAlign: 'center',
    },
    retryBtn: {
        backgroundColor: '#00C851',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
        marginTop: 10,
    },
    retryText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    headerRight: {
        padding: 5,
    },
    dealsCountContainer: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#f8f9fa',
    },
    dealsCountText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    listContainer: {
        padding: 15,
    },
    dealCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
        borderWidth: 0.5,
        borderColor: '#f0f0f0',
    },
    dealImageContainer: {
        height: 180,
        width: '100%',
        position: 'relative',
    },
    dealImage: {
        width: '100%',
        height: '100%',
    },
    dealBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#FF5722',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 15,
    },
    dealBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    timeLeftBadge: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeLeftText: {
        fontSize: 10,
        color: '#FF5722',
        marginLeft: 4,
        fontWeight: '600',
    },
    dealInfo: {
        padding: 15,
    },
    dealTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    dealDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
        lineHeight: 20,
    },
    productInfo: {
        marginBottom: 12,
    },
    productLabel: {
        fontSize: 12,
        color: '#888',
        marginBottom: 2,
    },
    productName: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    priceSection: {
        marginBottom: 12,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 4,
    },
    currentPrice: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#00C851',
        marginRight: 10,
    },
    originalPrice: {
        fontSize: 16,
        color: '#999',
        textDecorationLine: 'line-through',
    },
    savingsContainer: {
        backgroundColor: '#E8F5E8',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    savingsText: {
        fontSize: 12,
        color: '#00C851',
        fontWeight: '600',
    },
    productsCount: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    productsCountText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 5,
    },
    noDealsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    noDealsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 15,
        marginBottom: 8,
    },
    noDealsText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 20,
    },
    browseProductsBtn: {
        backgroundColor: '#00C851',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
    },
    browseProductsText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});

export default AllDeals;