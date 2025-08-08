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
    StatusBar,
    Animated,
} from 'react-native';
import { MaterialIcons, Feather, Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';
import useGet from '../hooks/useGet'; // Adjust import path as needed
import usePost from '../hooks/usePost';
import appColors from '../colors/appColors';
import { DealDetailsSkeleton } from '../skeletons/DealSkeleton';
const { width, height } = Dimensions.get('window');

const themeColors = {
    ...appColors,
    primaryBlue: '#0e5aa6',
    lightBlue: '#3f7fc0',
    paleBlue: '#d9e6f2',
    darkBlue: '#0c4b8b',
    accentOrange: '#f4a261',
    stockGreen: appColors.Hover_Button,
    stockRed: '#e63946',
    gradientStart: '#1e40af',
    gradientEnd: '#3b82f6',
    cardBlue: '#f0f7ff',
    textBlue: '#1e3a8a',
};

const DealDetails = ({ navigation, route }) => {
    const { dealId } = route.params;
    const { data: dealData, loading, error, refetch } = useGet(`/deals/${dealId}`);
    const [deal, setDeal] = useState(null);
    const { post, loading: postLoading } = usePost();
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const addToCart = async (product, variantName = 'Default') => {
        const result = await post('/api/cart/add', {
            itemType: 'product',
            productId: product._id,
            quantity: 1,
            variantName: variantName
        }, true);

        if (result) {
            Toast.show({
                type: 'success',
                text1: 'Added to Cart',
                text2: `${product.name} has been added to your cart.`,
                position: 'top',
            });
        }
    };

    const addDealToCart = async (dealId) => {
        const result = await post('/api/cart/add', {
            itemType: "deal",
            dealId: dealId,
        }, true);

        if (result) {
            Toast.show({
                type: 'success',
                text1: 'Deal Added',
                text2: 'The deal has been added to your cart.',
                position: 'top',
            });
        }
    };

    useEffect(() => {
        if (dealData) {
            setDeal(dealData);
            setIsInitialLoad(false);
        } else if (!loading) {
            setIsInitialLoad(false);
        }
    }, [dealData, loading]);

    const formatPrice = (price) => {
        return `Rs ${price.toFixed(2)}`;
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
            return `${days}d left`;
        }
        return `${hours}h left`;
    };

    const renderProductCard = ({ item, index }) => {
        const product = item.product;

        return (
            <TouchableOpacity
                style={styles.productCard}
                onPress={() => navigation.navigate("Product", { productId: product._id })}
                activeOpacity={0.95}
            >
                <View style={styles.productImageContainer}>
                    <Image
                        source={{ uri: product.images[0] }}
                        style={styles.productImage}
                        resizeMode="cover"
                    />
                    {product.hasActiveSale && (
                        <View style={styles.salebadge}>
                            <Text style={styles.saleBadgeText}>SALE</Text>
                        </View>
                    )}
                    <View style={styles.stockIndicator}>
                        <View style={[
                            styles.stockDot,
                            { backgroundColor: product.stock > 0 ? themeColors.stockGreen : themeColors.stockRed }
                        ]} />
                    </View>
                </View>

                <View style={styles.productContent}>
                    <View style={styles.productHeader}>
                        <Text style={styles.productBrand}>{product.brand}</Text>
                        <TouchableOpacity
                            style={styles.quickAddBtn}
                            onPress={(e) => {
                                e.stopPropagation();
                                addToCart(product);
                            }}
                            disabled={product.stock === 0}
                        >
                            <Ionicons
                                name="add"
                                size={16}
                                color={product.stock > 0 ? themeColors.primaryBlue : "#ccc"}
                            />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>

                    <View style={styles.priceContainer}>
                        <Text style={styles.currentPrice}>{formatPrice(product.bestPrice)}</Text>
                        {product.hasActiveSale && (
                            <Text style={styles.originalPrice}>
                                {product.priceRange.split(' - ')[1] || formatPrice(product.startingPrice)}
                            </Text>
                        )}
                    </View>

                    <View style={styles.stockRow}>
                        <Text style={[
                            styles.stockText,
                            { color: product.stock > 0 ? themeColors.stockGreen : themeColors.stockRed }
                        ]}>
                            {product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (isInitialLoad || loading) {
        return <DealDetailsSkeleton />;
    }

    if (error || (!loading && !deal)) {
        return (
            <View style={styles.errorContainer}>
                <LinearGradient
                    colors={[themeColors.lightBlue, themeColors.primaryBlue]}
                    style={styles.errorIcon}
                >
                    <Ionicons name="alert-circle-outline" size={32} color="#fff" />
                </LinearGradient>
                <Text style={styles.errorTitle}>Something went wrong</Text>
                <Text style={styles.errorText}>We couldn't load this deal</Text>
                <TouchableOpacity style={styles.retryButton} onPress={refetch}>
                    <LinearGradient
                        colors={[themeColors.lightBlue, themeColors.primaryBlue]}
                        style={styles.retryGradient}
                    >
                        <Text style={styles.retryText}>Try Again</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        );
    }

    const savings = calculateSavings(deal.originalPrice, deal.dealPrice);
    const isExpired = new Date(deal.validUntil) <= new Date();
    const isExpiringSoon = new Date(deal.validUntil) - new Date() <= 2 * 24 * 60 * 60 * 1000;

    return (
        <View style={styles.container}>
            {/* Floating Back Button */}
            <TouchableOpacity
                style={styles.floatingBackBtn}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            {/* Floating Share Button */}
            <TouchableOpacity style={styles.floatingShareBtn}>
                <Ionicons name="share-outline" size={20} color="#fff" />
            </TouchableOpacity>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Banner */}
                <View style={styles.heroContainer}>
                    <Image
                        source={{ uri: deal.bannerImage }}
                        style={styles.heroImage}
                        resizeMode="cover"
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(14,90,166,0.7)']}
                        style={styles.heroGradient}
                    />

                    {/* Deal Badge */}
                    <LinearGradient
                        colors={[themeColors.accentOrange, '#ff8c42']}
                        style={styles.heroBadge}
                    >
                        <Text style={styles.heroDiscountText}>{savings.percentage}%</Text>
                        <Text style={styles.heroDiscountLabel}>OFF</Text>
                    </LinearGradient>

                    {/* Timer Badge */}
                    <View style={[styles.heroTimer, isExpiringSoon && styles.urgentTimer]}>
                        <Ionicons
                            name="time-outline"
                            size={14}
                            color={isExpired ? themeColors.stockRed : isExpiringSoon ? themeColors.accentOrange : themeColors.primaryBlue}
                        />
                        <Text style={[
                            styles.heroTimerText,
                            { color: isExpired ? themeColors.stockRed : isExpiringSoon ? themeColors.accentOrange : themeColors.primaryBlue }
                        ]}>
                            {isExpired ? 'Expired' : getTimeRemaining(deal.validUntil)}
                        </Text>
                    </View>
                </View>

                {/* Deal Content */}
                <View style={styles.contentContainer}>
                    {/* Title Section */}
                    <View style={styles.titleSection}>
                        <Text style={styles.dealTitle}>{deal.title}</Text>
                        <Text style={styles.dealDescription}>{deal.description}</Text>
                    </View>

                    {/* Price Card */}
                    <View style={styles.priceCard}>
                        <LinearGradient
                            colors={[themeColors.cardBlue, themeColors.paleBlue]}
                            style={styles.priceGradient}
                        >
                            <View style={styles.priceHeader}>
                                <Ionicons name="pricetag" size={20} color={themeColors.primaryBlue} />
                                <Text style={styles.priceCardTitle}>Deal Price</Text>
                            </View>

                            <View style={styles.priceRow}>
                                <Text style={styles.mainPrice}>{formatPrice(deal.dealPrice)}</Text>
                                <Text style={styles.crossedPrice}>{formatPrice(deal.originalPrice)}</Text>
                            </View>

                            <View style={styles.savingsRow}>
                                <Ionicons name="trending-down" size={16} color={themeColors.primaryBlue} />
                                <Text style={styles.savingsLabel}>You save {savings.savings}</Text>
                            </View>
                        </LinearGradient>
                    </View>

                    {/* Deal Status */}
                    <View style={styles.statusCard}>
                        <View style={styles.statusHeader}>
                            <Ionicons name="information-circle-outline" size={18} color={themeColors.textBlue} />
                            <Text style={styles.statusTitle}>Deal Status</Text>
                        </View>

                        <View style={styles.statusContent}>
                            <View style={[
                                styles.statusChip,
                                {
                                    backgroundColor: isExpired ? '#fee2e2' : deal.isActive ? themeColors.paleBlue : '#fef3c7',
                                }
                            ]}>
                                <Ionicons
                                    name={isExpired ? "close-circle" : deal.isActive ? "checkmark-circle" : "pause-circle"}
                                    size={14}
                                    color={isExpired ? themeColors.stockRed : deal.isActive ? themeColors.primaryBlue : themeColors.accentOrange}
                                />
                                <Text style={[
                                    styles.statusChipText,
                                    { color: isExpired ? themeColors.stockRed : deal.isActive ? themeColors.primaryBlue : themeColors.accentOrange }
                                ]}>
                                    {isExpired ? 'Expired' : deal.isActive ? 'Active' : 'Inactive'}
                                </Text>
                            </View>

                            <Text style={styles.validityText}>
                                Valid until {new Date(deal.validUntil).toLocaleDateString('en-US', {
                                    month: 'short',
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
                            <Ionicons name="cube-outline" size={20} color={themeColors.textBlue} />
                            <Text style={styles.sectionTitle}>
                                Included Products ({deal.products.length})
                            </Text>
                        </View>

                        <FlatList
                            data={deal.products}
                            keyExtractor={item => item._id}
                            renderItem={renderProductCard}
                            numColumns={2}
                            columnWrapperStyle={styles.productRow}
                            showsVerticalScrollIndicator={false}
                            scrollEnabled={false}
                            contentContainerStyle={styles.productsGrid}
                        />
                    </View>
                </View>
                {!isExpired && deal.isActive && (
                    <View style={styles.fabContainer}>
                        <TouchableOpacity
                            style={styles.fab}
                            onPress={() => addDealToCart(deal._id)}
                            disabled={postLoading}
                        >
                            <LinearGradient
                                colors={[themeColors.primaryBlue, themeColors.lightBlue]}
                                style={styles.fabGradient}
                            >
                                {postLoading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <>
                                        <Ionicons name="bag-add" size={20} color="#fff" />
                                        <Text style={styles.fabText}>Claim Deal</Text>
                                        <Text style={styles.fabPrice}>{formatPrice(deal.dealPrice)}</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: appColors.Background,
    },

    // Loading & Error States
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: appColors.Background,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: appColors.Text_Body,
        fontWeight: '500',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: appColors.Background,
        paddingHorizontal: 40,
    },
    errorIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: appColors.Text_Body,
        marginBottom: 8,
    },
    errorText: {
        fontSize: 16,
        color: '#718096',
        textAlign: 'center',
        marginBottom: 24,
    },
    retryButton: {
        borderRadius: 25,
        overflow: 'hidden',
    },
    retryGradient: {
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    retryText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },

    // Floating Buttons
    floatingBackBtn: {
        position: 'absolute',
        top: StatusBar.currentHeight + 20 || 60,
        left: 20,
        width: 44,
        height: 44,
        backgroundColor: 'rgba(14,90,166,0.8)',
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    floatingShareBtn: {
        position: 'absolute',
        top: StatusBar.currentHeight + 20 || 60,
        right: 20,
        width: 44,
        height: 44,
        backgroundColor: 'rgba(14,90,166,0.8)',
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },

    // Hero Section
    scrollView: {
        flex: 1,
    },
    heroContainer: {
        height: 300,
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    heroGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 120,
    },
    heroBadge: {
        position: 'absolute',
        top: 100,
        right: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    heroDiscountText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        lineHeight: 22,
    },
    heroDiscountLabel: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        lineHeight: 14,
    },
    heroTimer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        backgroundColor: 'rgba(255,255,255,0.95)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    urgentTimer: {
        backgroundColor: 'rgba(255,245,240,0.95)',
    },
    heroTimerText: {
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 6,
    },

    // Content Section
    contentContainer: {
        backgroundColor: appColors.Background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: -24,
        paddingTop: 24,
        paddingHorizontal: 20,
        paddingBottom: 120,
    },
    titleSection: {
        marginBottom: 20,
    },
    dealTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: themeColors.textBlue,
        marginBottom: 8,
        lineHeight: 32,
    },
    dealDescription: {
        fontSize: 16,
        color: appColors.Text_Body,
        lineHeight: 24,
    },

    // Price Card
    priceCard: {
        marginBottom: 20,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    priceGradient: {
        padding: 20,
    },
    priceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    priceCardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: themeColors.primaryBlue,
        marginLeft: 8,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 12,
    },
    mainPrice: {
        fontSize: 32,
        fontWeight: 'bold',
        color: themeColors.primaryBlue,
        marginRight: 16,
    },
    crossedPrice: {
        fontSize: 18,
        color: '#9CA3AF',
        textDecorationLine: 'line-through',
    },
    savingsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    savingsLabel: {
        fontSize: 14,
        color: themeColors.primaryBlue,
        fontWeight: '600',
        marginLeft: 6,
    },

    // Status Card
    statusCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderLeftWidth: 4,
        borderLeftColor: themeColors.primaryBlue,
    },
    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    statusTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: themeColors.textBlue,
        marginLeft: 8,
    },
    statusContent: {
        gap: 8,
    },
    statusChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    statusChipText: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
    },
    validityText: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },

    // Products Section
    productsSection: {
        marginTop: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: themeColors.textBlue,
        marginLeft: 8,
    },
    productsGrid: {
        gap: 12,
    },
    productRow: {
        justifyContent: 'space-between',
        marginBottom: 12,
    },

    // Product Card (Compact)
    productCard: {
        flex: 0.48,
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderTopWidth: 2,
        borderTopColor: themeColors.paleBlue,
    },
    productImageContainer: {
        height: 120,
        position: 'relative',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    salebadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: themeColors.accentOrange,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    saleBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    stockIndicator: {
        position: 'absolute',
        top: 8,
        left: 8,
    },
    stockDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    productContent: {
        padding: 12,
    },
    productHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    productBrand: {
        fontSize: 11,
        color: themeColors.lightBlue,
        textTransform: 'uppercase',
        fontWeight: '500',
        letterSpacing: 0.5,
    },
    quickAddBtn: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: themeColors.paleBlue,
        justifyContent: 'center',
        alignItems: 'center',
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: themeColors.textBlue,
        marginBottom: 8,
        lineHeight: 18,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 6,
    },
    currentPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: themeColors.primaryBlue,
        marginRight: 6,
    },
    originalPrice: {
        fontSize: 12,
        color: '#9CA3AF',
        textDecorationLine: 'line-through',
    },
    stockRow: {
        alignItems: 'flex-start',
    },
    stockText: {
        fontSize: 11,
        fontWeight: '500',
    },

    // Floating Action Button
    fabContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        zIndex: 10,
    },
    fab: {
        borderRadius: 25,
        overflow: 'hidden',
        shadowColor: themeColors.primaryBlue,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 8,
    },
    fabGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    fabText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
        marginRight: 12,
    },
    fabPrice: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default DealDetails;