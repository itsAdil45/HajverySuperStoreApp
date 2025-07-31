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
    Dimensions,
    Alert,
} from 'react-native';
import { MaterialIcons, Feather, Ionicons } from '@expo/vector-icons';
import useGet from '../hooks/useGet'; // Adjust import path as needed
import usePost from '../hooks/usePost';
const { width } = Dimensions.get('window');

const DealDetails = ({ navigation, route }) => {
    const { dealId } = route.params;
    const { data: dealData, loading, error, refetch } = useGet(`/deals/${dealId}`);
    const [deal, setDeal] = useState(null);
    const { post, loading: postLoading } = usePost();

    const addToCart = async (product, variantName = 'Default') => {
        const result = await post('/api/cart/add', {
            itemType: 'product',
            productId: product._id,
            quantity: 1,
            variantName: variantName
        }, true);

        if (result) {
            Alert.alert('Success', 'Item added to cart!');
        }
    };
    const addDealToCart = async (dealId) => {
        const result = await post('/api/cart/add', {
            itemType: "deal",
            dealId: dealId,
        }, true);

        if (result) {
            Alert.alert('Success', 'Deal added to cart!');
            // refetchCart(); // Refresh cart data
        }
    };

    useEffect(() => {
        if (dealData) {
            setDeal(dealData);
        }
    }, [dealData]);

    const formatPrice = (price) => {
        return `$${price.toFixed(2)}`;
    };

    const calculateSavings = (originalPrice, dealPrice) => {
        const savings = originalPrice - dealPrice;
        const percentage = Math.round((savings / originalPrice) * 100);
        return { savings: formatPrice(savings), percentage };
    };

    const getTimeRemaining = (validUntil) => {
        const now = new Date();
        const endDate = new Date(validUntil);
        const timeDiff = endDate - now;

        if (timeDiff <= 0) return 'Expired';

        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) {
            return `${days} day${days > 1 ? 's' : ''} left`;
        }
        return `${hours} hour${hours > 1 ? 's' : ''} left`;
    };

    const handleAddToCart = (product) => {
        // Implement add to cart functionality
        Alert.alert(
            "Add to Cart",
            `Add ${product.name} to cart?`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Add", onPress: () => console.log("Added to cart:", product.name) }
            ]
        );
    };

    const renderProductCard = ({ item }) => {
        const product = item.product;
        return (
            <TouchableOpacity style={styles.productCard} onPress={() => navigation.navigate("Product", { productId: product._id })}>
                <Image
                    source={{ uri: product.images[0] }}
                    style={styles.productImage}
                    resizeMode="cover"
                />
                <View style={styles.productInfo} >
                    <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                    <Text style={styles.productBrand}>{product.brand}</Text>
                    <Text style={styles.productDescription} numberOfLines={2}>
                        {product.description}
                    </Text>

                    <View style={styles.productPricing}>
                        <View style={styles.priceRow}>
                            <Text style={styles.productPrice}>
                                {formatPrice(product.bestPrice)}
                            </Text>
                            {product.hasActiveSale && (
                                <Text style={styles.productOriginalPrice}>
                                    {product.priceRange.split(' - ')[1] || formatPrice(product.startingPrice)}
                                </Text>
                            )}
                        </View>

                        {product.hasActiveSale && (
                            <View style={styles.saleTag}>
                                <Text style={styles.saleText}>ON SALE</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.stockInfo}>
                        <MaterialIcons
                            name="inventory"
                            size={14}
                            color={product.stock > 0 ? "#00C851" : "#FF5252"}
                        />
                        <Text style={[
                            styles.stockText,
                            { color: product.stock > 0 ? "#00C851" : "#FF5252" }
                        ]}>
                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.addToCartBtn,
                            { opacity: product.stock > 0 ? 1 : 0.5 }
                        ]}
                        onPress={() => addToCart(product)}
                        disabled={product.stock === 0}
                    >
                        <MaterialIcons name="add-shopping-cart" size={16} color="#fff" />
                        <Text style={styles.addToCartText}>Add to Cart</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00C851" />
                <Text style={styles.loadingText}>Loading deal details...</Text>
            </View>
        );
    }

    if (error || !deal) {
        return (
            <View style={styles.errorContainer}>
                <MaterialIcons name="error-outline" size={48} color="#FF5252" />
                <Text style={styles.errorText}>Failed to load deal details</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
                    <Text style={styles.retryText}>Try Again</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const savings = calculateSavings(deal.originalPrice, deal.dealPrice);
    const isExpired = new Date(deal.validUntil) <= new Date();

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
                <Text style={styles.headerTitle}>Deal Details</Text>
                <TouchableOpacity style={styles.shareButton}>
                    <Feather name="share" size={20} color="#000" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Deal Banner */}
                <View style={styles.bannerContainer}>
                    <Image
                        source={{ uri: deal.bannerImage }}
                        style={styles.bannerImage}
                        resizeMode="cover"
                    />
                    <View style={styles.bannerOverlay}>
                        <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>{savings.percentage}% OFF</Text>
                        </View>
                        <View style={styles.timerBadge}>
                            <MaterialIcons name="access-time" size={14} color="#FF5722" />
                            <Text style={styles.timerText}>
                                {isExpired ? 'Expired' : getTimeRemaining(deal.validUntil)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Deal Info */}
                <View style={styles.dealInfoContainer}>
                    <Text style={styles.dealTitle}>{deal.title}</Text>
                    <Text style={styles.dealDescription}>{deal.description}</Text>

                    {/* Price Section */}
                    <View style={styles.priceSection}>
                        <View style={styles.mainPriceRow}>
                            <Text style={styles.dealPrice}>{formatPrice(deal.dealPrice)}</Text>
                            <Text style={styles.originalPrice}>{formatPrice(deal.originalPrice)}</Text>
                        </View>
                        <View style={styles.savingsHighlight}>
                            <MaterialIcons name="savings" size={18} color="#00C851" />
                            <Text style={styles.savingsText}>You save {savings.savings}</Text>
                        </View>
                    </View>

                    {/* Deal Status */}
                    <View style={styles.statusContainer}>
                        <View style={[
                            styles.statusBadge,
                            { backgroundColor: isExpired ? '#FFE5E5' : deal.isActive ? '#E8F5E8' : '#FFF3E0' }
                        ]}>
                            <MaterialIcons
                                name={isExpired ? "cancel" : deal.isActive ? "check-circle" : "pause-circle-filled"}
                                size={16}
                                color={isExpired ? "#FF5252" : deal.isActive ? "#00C851" : "#FF9800"}
                            />
                            <Text style={[
                                styles.statusText,
                                { color: isExpired ? "#FF5252" : deal.isActive ? "#00C851" : "#FF9800" }
                            ]}>
                                {isExpired ? 'Expired' : deal.isActive ? 'Active' : 'Inactive'}
                            </Text>
                        </View>

                        <View style={styles.validityInfo}>
                            <Text style={styles.validityLabel}>Valid until:</Text>
                            <Text style={styles.validityDate}>
                                {new Date(deal.validUntil).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </Text>
                        </View>
                    </View>

                    {/* Products Section */}
                    <View style={styles.productsSection}>
                        <View style={styles.sectionHeader}>
                            <MaterialIcons name="inventory" size={20} color="#333" />
                            <Text style={styles.sectionTitle}>
                                Products in this deal ({deal.products.length})
                            </Text>
                        </View>

                        <FlatList
                            data={deal.products}
                            keyExtractor={item => item._id}
                            renderItem={renderProductCard}
                            showsVerticalScrollIndicator={false}
                            scrollEnabled={false}
                        />
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            {!isExpired && deal.isActive && (
                <View style={styles.bottomBar}>
                    <View style={styles.priceInfo}>
                        <Text style={styles.bottomPrice}>{formatPrice(deal.dealPrice)}</Text>
                        <Text style={styles.bottomOriginalPrice}>{formatPrice(deal.originalPrice)}</Text>
                    </View>
                    <TouchableOpacity style={styles.claimDealBtn} onPress={() => addDealToCart(deal._id)}>
                        <Text style={styles.claimDealText}>Claim Deal</Text>
                        <MaterialIcons name="arrow-forward" size={18} color="#fff" />
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
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    shareButton: {
        padding: 5,
    },
    scrollView: {
        flex: 1,
    },
    bannerContainer: {
        height: 250,
        position: 'relative',
    },
    bannerImage: {
        width: '100%',
        height: '100%',
    },
    bannerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'space-between',
        padding: 15,
    },
    discountBadge: {
        backgroundColor: '#FF5722',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-end',
    },
    discountText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    timerBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 15,
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
    },
    timerText: {
        fontSize: 12,
        color: '#FF5722',
        marginLeft: 4,
        fontWeight: '600',
    },
    dealInfoContainer: {
        padding: 20,
    },
    dealTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    dealDescription: {
        fontSize: 16,
        color: '#666',
        lineHeight: 22,
        marginBottom: 20,
    },
    priceSection: {
        backgroundColor: '#f8f9fa',
        padding: 15,
        borderRadius: 12,
        marginBottom: 20,
    },
    mainPriceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 8,
    },
    dealPrice: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#00C851',
        marginRight: 12,
    },
    originalPrice: {
        fontSize: 18,
        color: '#999',
        textDecorationLine: 'line-through',
    },
    savingsHighlight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    savingsText: {
        fontSize: 16,
        color: '#00C851',
        fontWeight: '600',
        marginLeft: 5,
    },
    statusContainer: {
        marginBottom: 25,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 15,
        alignSelf: 'flex-start',
        marginBottom: 10,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 5,
    },
    validityInfo: {
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 8,
    },
    validityLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    validityDate: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    productsSection: {
        marginTop: 10,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 8,
    },
    productCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
        borderWidth: 0.5,
        borderColor: '#f0f0f0',
    },
    productImage: {
        width: '100%',
        height: 150,
    },
    productInfo: {
        padding: 15,
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    productBrand: {
        fontSize: 12,
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 6,
    },
    productDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 18,
        marginBottom: 10,
    },
    productPricing: {
        marginBottom: 10,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    productPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#00C851',
        marginRight: 8,
    },
    productOriginalPrice: {
        fontSize: 14,
        color: '#999',
        textDecorationLine: 'line-through',
    },
    saleTag: {
        backgroundColor: '#FFE5E5',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    saleText: {
        fontSize: 10,
        color: '#FF5252',
        fontWeight: 'bold',
    },
    stockInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    stockText: {
        fontSize: 12,
        marginLeft: 4,
        fontWeight: '500',
    },
    addToCartBtn: {
        backgroundColor: '#00C851',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
    },
    addToCartText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
        marginLeft: 5,
    },
    bottomBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    priceInfo: {
        flex: 1,
    },
    bottomPrice: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#00C851',
    },
    bottomOriginalPrice: {
        fontSize: 14,
        color: '#999',
        textDecorationLine: 'line-through',
    },
    claimDealBtn: {
        backgroundColor: '#00C851',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
    },
    claimDealText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        marginRight: 5,
    }
});

export default DealDetails;