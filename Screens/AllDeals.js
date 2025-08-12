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
    Dimensions,
    StatusBar,
    Animated,
} from 'react-native';
import { MaterialIcons, Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import useGet from '../hooks/useGet'; // Adjust import path as needed
import appColors from '../colors/appColors';
import { AllDealsSkeleton } from '../skeletons/DealSkeleton';
import { DealsSkeleton } from '../skeletons/SkeletonComponents';
const { width, height } = Dimensions.get('window');

const AllDeals = ({ navigation }) => {
    const { data: dealsData, loading: dealsLoading, error: dealsError, refetch } = useGet('/deals');
    const [deals, setDeals] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [scrollY] = useState(new Animated.Value(0));
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        if (dealsData && dealsData.deals) {
            setDeals(dealsData.deals);
            setIsInitialLoad(false);
        } else if (!dealsLoading) {
            setIsInitialLoad(false);
        }
    }, [dealsData, dealsLoading]);

    const formatPrice = (price) => {
        return `Rs ${price.toFixed(2)}`;
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

    const formatTimeLeft = (validUntil) => {
        const now = new Date();
        const endDate = new Date(validUntil);
        const diffTime = endDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) return 'Expired';
        if (diffDays === 1) return '1 day left';
        if (diffDays <= 7) return `${diffDays} days left`;
        return endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const renderDealCard = ({ item, index }) => {
        const dealProduct = item.products[0]?.product;
        const savings = calculateSavings(item.originalPrice, item.dealPrice);
        const timeLeft = formatTimeLeft(item.validUntil);
        const isExpiringSoon = new Date(item.validUntil) - new Date() <= 2 * 24 * 60 * 60 * 1000;

        return (
            <Animated.View
                style={[
                    styles.dealCard,
                    {
                        opacity: scrollY.interpolate({
                            inputRange: [0, 50, 100],
                            outputRange: [1, 1, 0.8],
                            extrapolate: 'clamp'
                        })
                    }
                ]}
            >
                <TouchableOpacity
                    activeOpacity={0.95}
                    onPress={() => navigation.navigate('DealDetails', { dealId: item._id })}
                >
                    {/* Enhanced Image Section */}
                    <View style={styles.dealImageContainer}>
                        <Image
                            source={{ uri: item.bannerImage }}
                            style={styles.dealImage}
                            resizeMode="cover"
                        />

                        {/* Gradient Overlay */}
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.3)']}
                            style={styles.imageGradient}
                        />

                        {/* Discount Badge */}
                        <LinearGradient
                            colors={[appColors.Primary_Button, appColors.Hover_Button]}
                            style={styles.discountBadge}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Text style={styles.discountText}>{savings.percentage}%</Text>
                            <Text style={styles.discountLabel}>OFF</Text>
                        </LinearGradient>

                        {/* Time Badge */}
                        <View style={[styles.timeBadge, isExpiringSoon && styles.urgentTimeBadge]}>
                            <Ionicons
                                name="time-outline"
                                size={14}
                                color={isExpiringSoon ? "#FF4444" : "#666"}
                            />
                            <Text style={[styles.timeText, isExpiringSoon && styles.urgentTimeText]}>
                                {timeLeft}
                            </Text>
                        </View>

                        {/* Heart Icon */}
                        <TouchableOpacity style={styles.favoriteBtn}>
                            <Ionicons name="heart-outline" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Enhanced Content Section */}
                    <View style={styles.dealContent}>
                        {/* Title and Description */}
                        <View style={styles.titleSection}>
                            <Text style={styles.dealTitle} numberOfLines={2}>{item.title}</Text>
                            <Text style={styles.dealDescription} numberOfLines={2}>{item.description}</Text>
                        </View>

                        {/* Featured Product */}
                        {dealProduct && (
                            <View style={styles.featuredProduct}>
                                <View style={styles.productTag}>
                                    <Ionicons name="star" size={12} color="#FFD700" />
                                    <Text style={styles.featuredLabel}>Featured</Text>
                                </View>
                                <Text style={styles.productName} numberOfLines={1}>{dealProduct.name}</Text>
                            </View>
                        )}

                        {/* Enhanced Price Section */}
                        <View style={styles.priceContainer}>
                            <View style={styles.priceRow}>
                                <Text style={styles.dealPrice}>{formatPrice(item.dealPrice)}</Text>
                                <Text style={styles.originalPrice}>{formatPrice(item.originalPrice)}</Text>
                            </View>
                            <View style={styles.savingsChip}>
                                <Ionicons name="trending-down" size={12} color={appColors.darkerBg} />
                                <Text style={styles.savingsAmount}>Save {savings.savings}</Text>
                            </View>
                        </View>

                        {/* Products Info */}
                        <View style={styles.productsInfo}>
                            <View style={styles.productsChip}>
                                <Ionicons name="cube-outline" size={14} color="#666" />
                                <Text style={styles.productsText}>
                                    {item.products.length} item{item.products.length > 1 ? 's' : ''}
                                </Text>
                            </View>
                            <TouchableOpacity style={styles.viewButton}>
                                <Text style={styles.viewButtonText}>View Deal</Text>
                                <Ionicons name="arrow-forward" size={14} color={appColors.darkerBg} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <LinearGradient
                colors={[appColors.darkerBg, appColors.Primary_Button]}
                style={styles.headerGradient}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>Hot Deals</Text>
                        <Text style={styles.headerSubtitle}>
                            {deals.length} amazing offers waiting for you
                        </Text>
                    </View>

                    <TouchableOpacity style={styles.filterButton}>
                        <Ionicons name="options-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </View>
    );

    if (dealsLoading && deals.length === 0 || isInitialLoad) {
        return (
            <AllDealsSkeleton itemCount={5} />
        );
    }

    if (dealsError && deals.length === 0) {
        return (
            <View style={styles.errorContainer}>
                <LinearGradient
                    colors={['#FF6B6B', '#FF5252']}
                    style={styles.errorIcon}
                >
                    <Ionicons name="cloud-offline-outline" size={32} color="#fff" />
                </LinearGradient>
                <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
                <Text style={styles.errorText}>We couldn't load the deals right now</Text>
                <TouchableOpacity style={styles.retryButton} onPress={refetch}>
                    <LinearGradient
                        colors={[appColors.darkerBg, appColors.lightBg]}
                        style={styles.retryGradient}
                    >
                        <Ionicons name="refresh" size={16} color="#fff" />
                        <Text style={styles.retryText}>Try Again</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* <StatusBar barStyle="light-content" backgroundColor="#00C851" /> */}

            {renderHeader()}

            {deals && deals.length > 0 ? (
                <Animated.FlatList
                    data={deals}
                    keyExtractor={item => item._id}
                    renderItem={renderDealCard}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: true }
                    )}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#00C851']}
                            tintColor="#00C851"
                            progressBackgroundColor="#fff"
                        />
                    }
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <LinearGradient
                        colors={['#E3F2FD', '#BBDEFB']}
                        style={styles.emptyIcon}
                    >
                        <Ionicons name="gift-outline" size={48} color="#2196F3" />
                    </LinearGradient>
                    <Text style={styles.emptyTitle}>No Deals Available</Text>
                    <Text style={styles.emptyText}>
                        Don't worry! New amazing deals are coming soon.{'\n'}
                        Check back later or browse our products.
                    </Text>
                    <TouchableOpacity
                        style={styles.browseButton}
                        onPress={() => navigation.navigate('CategoryTab')}
                    >
                        <LinearGradient
                            colors={['#00C851', '#00A843']}
                            style={styles.browseGradient}
                        >
                            <Ionicons name="storefront-outline" size={16} color="#fff" />
                            <Text style={styles.browseText}>Browse Products</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },

    // Header Styles
    headerContainer: {
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    headerGradient: {
        paddingTop: StatusBar.currentHeight || 44,
        paddingBottom: 20,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitleContainer: {
        flex: 1,
        marginLeft: 15,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    filterButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Deal Card Styles
    listContainer: {
        padding: 16,
        paddingBottom: 100,
    },
    dealCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 8,
        overflow: 'hidden',
    },
    dealImageContainer: {
        height: 200,
        position: 'relative',
        overflow: 'hidden',
    },
    dealImage: {
        width: '100%',
        height: '100%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    imageGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
    },
    discountBadge: {
        position: 'absolute',
        top: 15,
        right: 15,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    discountText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        lineHeight: 18,
    },
    discountLabel: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '600',
        lineHeight: 12,
    },
    timeBadge: {
        position: 'absolute',
        bottom: 15,
        left: 15,
        backgroundColor: 'rgba(255,255,255,0.95)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    urgentTimeBadge: {
        backgroundColor: 'rgba(255,240,240,0.95)',
    },
    timeText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
        fontWeight: '600',
    },
    urgentTimeText: {
        color: '#FF4444',
    },
    favoriteBtn: {
        position: 'absolute',
        top: 15,
        left: 15,
        width: 36,
        height: 36,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Content Styles
    dealContent: {
        padding: 20,
    },
    titleSection: {
        marginBottom: 12,
    },
    dealTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2D3748',
        lineHeight: 24,
        marginBottom: 4,
    },
    dealDescription: {
        fontSize: 14,
        color: '#718096',
        lineHeight: 20,
    },
    featuredProduct: {
        marginBottom: 15,
    },
    productTag: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    featuredLabel: {
        fontSize: 11,
        color: '#F59E0B',
        fontWeight: '600',
        marginLeft: 4,
        textTransform: 'uppercase',
    },
    productName: {
        fontSize: 14,
        color: '#4A5568',
        fontWeight: '500',
    },
    priceContainer: {
        marginBottom: 15,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 8,
    },
    dealPrice: {
        fontSize: 28,
        fontWeight: 'bold',
        color: appColors.Primary_Button,
        marginRight: 12,
    },
    originalPrice: {
        fontSize: 16,
        color: '#A0AEC0',
        textDecorationLine: 'line-through',
    },
    savingsChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: appColors.lightBg,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        borderRadius: 10
    },
    savingsAmount: {
        fontSize: 12,
        color: appColors.Hover_Button,
        fontWeight: '600',
        marginLeft: 4,
    },
    productsInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    productsChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7FAFC',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    productsText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
        fontWeight: '500',
    },
    viewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    viewButtonText: {
        fontSize: 13,
        color: appColors.Primary_Button,
        fontWeight: '600',
        marginRight: 4,
    },

    // Loading State
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
    },
    loadingContent: {
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    loadingText: {
        fontSize: 18,
        color: '#2D3748',
        fontWeight: '600',
        marginTop: 20,
        textAlign: 'center',
    },
    loadingSubtext: {
        fontSize: 14,
        color: '#718096',
        marginTop: 8,
        textAlign: 'center',
    },

    // Error State
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
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
        color: '#2D3748',
        textAlign: 'center',
        marginBottom: 8,
    },
    errorText: {
        fontSize: 16,
        color: '#718096',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 30,
    },
    retryButton: {
        borderRadius: 25,
        overflow: 'hidden',
    },
    retryGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    retryText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
        marginLeft: 8,
    },

    // Empty State
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2D3748',
        textAlign: 'center',
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 16,
        color: '#718096',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
    },
    browseButton: {
        borderRadius: 25,
        overflow: 'hidden',
    },
    browseGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 14,
    },
    browseText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
        marginLeft: 8,
    },
});

export default AllDeals;