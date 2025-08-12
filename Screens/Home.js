import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    Image,
    TouchableOpacity,
    FlatList,
    Dimensions
} from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

import useGet from '../hooks/useGet';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    interpolate,
    useAnimatedScrollHandler
} from 'react-native-reanimated';
import appColors from '../colors/appColors';
import usePut from '../hooks/usePut';
import {
    HeaderSkeleton,
    ProductsSkeleton,
    HomePageSkeleton
} from '../skeletons/SkeletonComponents';

const { width } = Dimensions.get('window');

const Home = ({ navigation }) => {
    const { data: categoriesData, loading: categoriesLoading, error: categoriesError, refetch: refetchCategories } = useGet('/categories/all_main');
    const { data: dealsData, loading: dealsLoading, error: dealsError, refetch: refetchDeals } = useGet('/deals');
    const { data: saleProductsData, loading: saleProductsLoading, error: saleProductsError, refetch: refetchSaleProducts } = useGet('/products');
    // const { data: homeConfigData, loading: homeConfigLoading, error: homeConfigError, refetch: refetchHomeConfig } = useGet('/admin/home-config'); // Admin endpoint for home page configuration
    const { put: updateFcmToken, loading: updateLoading, error: updateError } = usePut();

    const [categories, setCategories] = useState([]);
    const [deals, setDeals] = useState([]);
    const [saleProducts, setSaleProducts] = useState([]);
    const [homeConfig, setHomeConfig] = useState([]);
    const [keyword, setKeyword] = useState('');
    const { user } = useAuth();

    // Animation values
    const scrollY = useSharedValue(0);
    const saleAnimation = useSharedValue(0);
    const pulseAnimation = useSharedValue(0);
    const shimmerAnimation = useSharedValue(0);
    const headerOpacity = useSharedValue(1);


    const registerForPushNotificationsAsync = async () => {
        if (!user || user.role !== 'user') {
            console.log('FCM token not updated: User is not a regular user');
            return;
        }
        if (!Device.isDevice) {
            Alert.alert('Must use physical device');
            return;
        }
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            Alert.alert('Notification permissions not granted');
            return;
        }
        try {
            const tokenData = await Notifications.getDevicePushTokenAsync();
            return tokenData.data;
        } catch (err) {
            Alert.alert('Error fetching FCM token', err.message);
        }
    };

    useEffect(() => {
        const updateFcmTokenOnServer = async () => {
            try {
                if (!user || user.role !== 'user') {
                    console.log('FCM token not updated: User is not a regular user');
                    return;
                }
                const token = await registerForPushNotificationsAsync();
                console.log('FCM Token:', token);

                if (token && user) {
                    // Update FCM token using the put hook
                    const response = await updateFcmToken('/api/user/update-profile', {
                        fcmToken: token,
                    }, true);

                    if (response) {
                        console.log('FCM Token updated successfully on server');
                    } else if (updateError) {
                        console.error('Failed to update FCM token:', updateError);
                    }
                }
            } catch (error) {
                console.error('Error updating FCM token:', error);
            }
        };

        // Only update FCM token if user is logged in
        if (user) {
            updateFcmTokenOnServer();
        }
    }, [user]);

    useEffect(() => {
        if (categoriesData && categoriesData.categories) {
            setCategories(categoriesData.categories);
        }
    }, [categoriesData]);

    useEffect(() => {
        if (dealsData && dealsData.deals) {
            setDeals(dealsData.deals);
        }
    }, [dealsData]);

    useEffect(() => {
        if (saleProductsData) {
            // Filter products that have active sale
            const productsOnSale = saleProductsData.filter(product => product.hasActiveSale === true);
            setSaleProducts(productsOnSale);
        }
    }, [saleProductsData]);

    // useEffect(() => {
    //     if (homeConfigData && homeConfigData.categories) {
    //         setHomeConfig(homeConfigData.categories);
    //     }
    // }, [homeConfigData]);

    // Custom hooks for category-specific products
    const CategoryProductRow = ({ category, title, icon }) => {
        const { data: categoryProducts, loading: categoryLoading } = useGet(`/products?category=${category}`);

        const renderProductCard = ({ item }) => (
            <TouchableOpacity
                style={styles.productCard}
                onPress={() => navigation.navigate('Product', { productId: item.id })}
            >
                <Image source={{ uri: item.images?.[0] }} style={styles.productImage} />
                <View style={styles.productBadgeContainer}>
                    {item.hasActiveSale && (
                        <View style={styles.productSaleBadge}>
                            <Text style={styles.productBadgeText}>SALE</Text>
                        </View>
                    )}
                    {item.stock < 10 && (
                        <View style={styles.productLowStockBadge}>
                            <Text style={styles.productBadgeText}>LOW STOCK</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.productTitle} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.productCategory}>{item.category?.sub}</Text>
                <View style={styles.productPriceRow}>
                    {item.hasActiveSale && item.variants[0]?.isOnSale ? (
                        <>
                            <Text style={styles.productOldPrice}>Rs {item.variants[0]?.price.toFixed(2)}</Text>
                            <Text style={styles.productPrice}>Rs {item.bestPrice.toFixed(2)}</Text>
                        </>
                    ) : (
                        <Text style={styles.productPrice}>Rs {item.bestPrice.toFixed(2)}</Text>
                    )}
                </View>
                <View style={styles.productAddBtn}>
                    <Text style={styles.productAddText}>View</Text>
                </View>
            </TouchableOpacity>
        );

        // Show skeleton while loading
        if (categoryLoading) {
            return <ProductsSkeleton title={title} />;
        }

        if (!categoryProducts || categoryProducts.length === 0) {
            return null;
        }

        return (
            <View>
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleContainer}>
                        <MaterialIcons name={icon} size={22} color={appColors.Primary_Button} />
                        <Text style={styles.sectionTitle}>{title}</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('SearchResult', { search: category })}>
                        <Text style={styles.seeAll}>See All</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={categoryProducts.slice(0, 10)} // Limit to 10 items for performance
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.productsContainer}
                    renderItem={renderProductCard}
                />
            </View>
        );
    };

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
            headerOpacity.value = interpolate(
                event.contentOffset.y,
                [0, 100],
                [1, 0.8],
                'clamp'
            );
        },
    });

    const animatedHeaderStyle = useAnimatedStyle(() => {
        return {
            opacity: headerOpacity.value,
            transform: [
                {
                    translateY: interpolate(
                        scrollY.value,
                        [0, 100],
                        [0, -10],
                        'clamp'
                    )
                }
            ]
        };
    });

    const animatedSaleBadgeStyle = useAnimatedStyle(() => {
        const translateY = interpolate(saleAnimation.value, [0, 1], [0, -5]);
        const scale = interpolate(saleAnimation.value, [0, 0.5, 1], [1, 1.05, 1]);

        return {
            transform: [
                { translateY },
                { scale }
            ]
        };
    });

    const animatedPulseStyle = useAnimatedStyle(() => {
        const scale = interpolate(pulseAnimation.value, [0, 1], [1, 1.1]);
        const opacity = interpolate(pulseAnimation.value, [0, 0.5, 1], [0.7, 1, 0.7]);

        return {
            transform: [{ scale }],
            opacity
        };
    });

    const animatedShimmerStyle = useAnimatedStyle(() => {
        const translateX = interpolate(shimmerAnimation.value, [0, 1], [-width, width]);

        return {
            transform: [{ translateX }]
        };
    });

    const formatPrice = (price) => {
        return `Rs ${price.toFixed(2)}`;
    };

    const calculateSavings = (originalPrice, dealPrice) => {
        const savings = originalPrice - dealPrice;
        const percentage = Math.round((savings / originalPrice) * 100);
        return { savings: formatPrice(savings), percentage };
    };

    // Show full page skeleton while initial data is loading
    if (categoriesLoading || dealsLoading || saleProductsLoading) {
        return <HomePageSkeleton />;
    }

    // Show error state
    if (categoriesError || dealsError || saleProductsError) {
        return (
            <View style={styles.errorContainer}>
                <MaterialIcons name="error-outline" size={48} color="#FF5252" />
                <Text style={styles.errorText}>Oops! Something went wrong</Text>
                <TouchableOpacity
                    style={styles.retryBtn}
                    onPress={() => {
                        refetchCategories();
                        refetchDeals();
                        refetchSaleProducts();
                        // refetchHomeConfig();
                    }}
                >
                    <Text style={styles.retryText}>Try Again</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const renderDealCard = ({ item, index }) => {
        const dealProduct = item.products[0]?.product;
        const savings = calculateSavings(item.originalPrice, item.dealPrice);

        return (
            <View style={styles.dealCard}>
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('DealDetails', { dealId: item._id })}
                >
                    {/* Image with Animated Badge */}
                    <View style={styles.dealImageContainer}>
                        <Image
                            source={{ uri: item.bannerImage }}
                            style={styles.dealImage}
                            resizeMode="cover"
                        />

                        {/* Animated Sale Badge */}
                        <Animated.View style={[styles.dealBadge, animatedSaleBadgeStyle]}>
                            <Text style={styles.dealBadgeText}>{savings.percentage}% OFF</Text>
                            <View style={styles.sparkle}>
                                <Text style={styles.sparkleText}>✨</Text>
                            </View>
                        </Animated.View>

                        {/* Gradient Overlay */}
                        <View style={styles.gradientOverlay} />
                    </View>

                    {/* Deal Info with Modern Layout */}
                    <View style={styles.dealInfo}>
                        <Text style={styles.dealTitle} numberOfLines={1}>{item.title}</Text>

                        {/* Price Row with Better Spacing */}
                        <View style={styles.priceRow}>
                            <Text style={styles.currentPrice}>{formatPrice(item.dealPrice)}</Text>
                            <Text style={styles.originalPrice}>{formatPrice(item.originalPrice)}</Text>
                        </View>

                        {/* Enhanced Meta Info */}
                        <View style={styles.dealMeta}>
                            <View style={styles.savingsPill}>
                                <MaterialIcons name="savings" size={10} color="white" />
                                <Text style={styles.savingsText}>Save {savings.savings}</Text>
                            </View>
                            <View style={styles.timerContainer}>
                                <MaterialIcons name="schedule" size={12} color="#FF5722" />
                                <Text style={styles.timerText}>
                                    {new Date(item.validUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </Text>
                            </View>
                        </View>

                        {/* Action Button */}
                        <TouchableOpacity style={styles.dealActionBtn}>
                            <Text style={styles.dealActionText}>Grab Deal</Text>
                            <MaterialIcons name="arrow-forward" size={14} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    const renderSaleProductCard = ({ item }) => (
        <TouchableOpacity
            style={styles.productCard}
            onPress={() => navigation.navigate('Product', { productId: item.id })}
        >
            <Image source={{ uri: item.images?.[0] }} style={styles.productImage} />
            <View style={styles.productBadgeContainer}>
                <View style={styles.productSaleBadge}>
                    <Text style={styles.productBadgeText}>SALE</Text>
                </View>
                {item.stock < 10 && (
                    <View style={styles.productLowStockBadge}>
                        <Text style={styles.productBadgeText}>LOW STOCK</Text>
                    </View>
                )}
            </View>
            <Text style={styles.productTitle} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.productCategory}>{item.category?.sub}</Text>
            <View style={styles.productPriceRow}>
                {item.variants[0]?.isOnSale ? (
                    <>
                        <Text style={styles.productOldPrice}>Rs {item.variants[0]?.price.toFixed(2)}</Text>
                        <Text style={styles.productPrice}>Rs {item.bestPrice.toFixed(2)}</Text>
                    </>
                ) : (
                    <Text style={styles.productPrice}>Rs {item.bestPrice.toFixed(2)}</Text>
                )}
            </View>
            <TouchableOpacity style={styles.productAddBtn}>
                <Text style={styles.productAddText}>Add to Cart</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    const renderCategoryItem = ({ item, index }) => {
        return (
            <TouchableOpacity
                style={styles.categoryItem}
                onPress={() => navigation.navigate("Products", { mainCategoryID: item._id })}
            >
                <View style={styles.categoryIconContainer}>
                    <Image source={{ uri: item.icon }} style={styles.categoryIcon} />
                    <View style={styles.categoryIconOverlay} />
                </View>
                <Text style={styles.categoryText}>{item.name}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <Animated.ScrollView
            style={[styles.container]}
            showsVerticalScrollIndicator={false}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
        >
            {/* Header - Show skeleton if user data is still loading */}
            {!user ? (
                <HeaderSkeleton />
            ) : (
                <Animated.View style={[styles.header, animatedHeaderStyle]}>
                    <View>
                        <Text style={styles.locationTitle}>Hello! 👋</Text>
                        <Text style={styles.locationText}>
                            {user?.address?.split("/")[0]?.trim() || 'Select Location'}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate("CartTab")}>
                        <Feather name="shopping-cart" size={22} color="#000" />
                        {/* <View style={styles.cartBadge}>
                            <Text style={styles.cartBadgeText}>3</Text>
                        </View> */}
                    </TouchableOpacity>
                </Animated.View>
            )}

            {/* Enhanced Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Ionicons name="search-outline" size={20} color="#888" />
                    <TextInput
                        placeholder="What are you craving today?"
                        style={styles.searchInput}
                        value={keyword}
                        onChangeText={setKeyword}
                        returnKeyType="search"
                        placeholderTextColor="#888"
                        onSubmitEditing={() => {
                            if (keyword?.trim()) {
                                navigation.navigate('SearchResult', { search: keyword.trim() });
                            }
                        }}
                    />
                </View>
                <TouchableOpacity
                    style={styles.filterBtn}
                    onPress={() => {
                        if (keyword?.trim()) {
                            navigation.navigate('SearchResult', { search: keyword.trim() });
                        }
                    }}
                >
                    <Ionicons name="options-outline" size={18} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Categories Section */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Explore Categories</Text>
                <TouchableOpacity onPress={() => navigation.navigate("CategoryTab")}>
                    <Text style={styles.seeAll}>View All</Text>
                </TouchableOpacity>
            </View>

            {categories && categories.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
                    {categories.map((cat, index) => (
                        <TouchableOpacity
                            key={cat.id || index}
                            style={styles.categoryItem}
                            onPress={() => navigation.navigate("Products", { mainCategoryID: cat._id })}
                        >
                            <View style={styles.categoryIconContainer}>
                                <Image source={{ uri: cat.icon }} style={styles.categoryIcon} />
                                <View style={styles.categoryIconOverlay} />
                            </View>
                            <Text style={styles.categoryText}>{cat.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            ) : (
                <View style={styles.noCategoriesContainer}>
                    <Text style={styles.noCategoriesText}>🍽️ Categories coming soon!</Text>
                </View>
            )}

            {/* Enhanced Banner with Shimmer Effect */}
            <View style={styles.banner}>
                <Animated.View style={[styles.shimmerOverlay, animatedShimmerStyle]} />
                <View style={styles.bannerContent}>
                    <Text style={styles.bannerTitle}>
                        🌍 World Food Festival{"\n"}Bring the world to your Kitchen!
                    </Text>
                    <TouchableOpacity style={styles.shopNowBtn}>
                        <Text style={styles.shopNowText}>Explore Now</Text>
                        <MaterialIcons name="explore" size={16} color="#fff" />
                    </TouchableOpacity>
                </View>
                <Image source={require('../assets/cat1.png')} style={styles.bannerImage} />
            </View>

            {/* Hot Deals Section with Pulse Animation */}
            <View style={styles.sectionHeader}>
                <Animated.View style={[styles.sectionTitleContainer, animatedPulseStyle]}>
                    <MaterialIcons name="local-fire-department" size={22} color="#FF5722" />
                    <Text style={styles.sectionTitle}>Hot Deals</Text>
                </Animated.View>
                <TouchableOpacity onPress={() => navigation.navigate('DealsTab')}>
                    <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
            </View>

            {deals && deals.length > 0 ? (
                <FlatList
                    data={deals}
                    keyExtractor={(item, index) => item.id || index.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.dealsContainer}
                    renderItem={renderDealCard}
                />
            ) : (
                <View style={styles.noDealsContainer}>
                    <MaterialIcons name="local-offer" size={48} color="#ccc" />
                    <Text style={styles.noDealsText}>🎯 Amazing deals loading...</Text>
                </View>
            )}

            {/* Sale Products Section */}
            {saleProducts && saleProducts.length > 0 && (
                <>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleContainer}>
                            <MaterialIcons name="flash-on" size={22} color="#FFD700" />
                            <Text style={styles.sectionTitle}>Flash Sale</Text>
                        </View>
                        <TouchableOpacity onPress={() => navigation.navigate('SearchResult', { hasActiveSale: true })}>
                            <Text style={styles.seeAll}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={saleProducts.slice(0, 10)} // Limit to 10 items
                        keyExtractor={(item) => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.productsContainer}
                        renderItem={renderSaleProductCard}
                    />
                </>
            )}

            {/* Dynamic Category Product Rows */}
            {homeConfig && homeConfig.length > 0 && homeConfig.map((config, index) => (
                <CategoryProductRow
                    key={config.category || index}
                    category={config.category}
                    title={config.title}
                    icon={config.icon || "category"}
                />
            ))}

            {/* Fallback Category Rows if no admin config */}
            {(!homeConfig || homeConfig.length === 0) && (
                <>
                    <CategoryProductRow
                        category="fruits"
                        title="Fresh Fruits"
                        icon="eco"
                    />
                    <CategoryProductRow
                        category="bread"
                        title="Fresh Bread"
                        icon="bakery-dining"
                    />
                </>
            )}

            {/* Bottom Spacing */}
            <View style={styles.bottomSpacing} />
        </Animated.ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        flex: 1
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
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
        marginVertical: 15,
        textAlign: 'center',
        fontWeight: '600',
    },
    retryBtn: {
        backgroundColor: '#00C851',
        paddingHorizontal: 28,
        paddingVertical: 14,
        borderRadius: 25,
        marginTop: 10,
        shadowColor: '#00C851',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    retryText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
    header: {
        padding: 20,
        paddingTop: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    locationTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    locationText: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
    },
    cartButton: {
        position: 'relative',
        padding: 8,
    },
    cartBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#FF5722',
        borderRadius: 10,
        width: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        alignItems: 'center',
        marginBottom: 10,
    },
    searchBox: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#F8F9FA',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 15,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    searchInput: {
        marginLeft: 10,
        flex: 1,
        fontSize: 15,
        color: '#333',
    },
    filterBtn: {
        backgroundColor: appColors.Primary_Button,
        padding: 12,
        borderRadius: 15,
        marginLeft: 12,
        shadowColor: appColors.lightBg,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    sectionHeader: {
        paddingHorizontal: 20,
        paddingTop: 25,
        paddingBottom: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionTitle: {
        fontWeight: '700',
        fontSize: 20,
        marginLeft: 8,
        color: '#333',
    },
    seeAll: {
        color: appColors.Primary_Button,
        fontSize: 14,
        fontWeight: '600',
    },
    categoryRow: {
        paddingVertical: 10,
        paddingLeft: 20,
    },
    categoryItem: {
        marginRight: 20,
        alignItems: 'center',
        width: 85,
    },
    categoryIconContainer: {
        position: 'relative',
        marginBottom: 8,
    },
    categoryIcon: {
        width: 70,
        height: 70,
        borderRadius: 20,
    },
    categoryIconOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(175, 249, 204, 0.1)',
        borderRadius: 20,
    },
    categoryText: {
        fontSize: 13,
        textAlign: 'center',
        fontWeight: '600',
        color: '#333',
    },
    noCategoriesContainer: {
        padding: 30,
        alignItems: 'center',
    },
    noCategoriesText: {
        color: '#999',
        fontSize: 16,
        fontWeight: '500',
    },
    banner: {
        margin: 20,
        backgroundColor: appColors.lightBg,
        borderRadius: 25,
        padding: 20,
        position: 'relative',
        overflow: 'hidden',
        minHeight: 120,
    },
    bannerContent: {
        zIndex: 2,
    },
    bannerTitle: {
        fontWeight: '700',
        fontSize: 18,
        color: '#333',
        marginBottom: 15,
        lineHeight: 24,
    },
    shopNowBtn: {
        backgroundColor: appColors.Hover_Button,
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 15,
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: appColors.lightBg,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    shopNowText: {
        color: '#fff',
        fontWeight: '700',
        marginRight: 6,
    },
    bannerImage: {
        position: 'absolute',
        right: 15,
        bottom: 0,
        width: 110,
        height: 110,
        resizeMode: 'contain',
        zIndex: 1,
    },
    shimmerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        width: 100,
    },
    dealsContainer: {
        paddingLeft: 20,
        paddingBottom: 15,
    },
    productsContainer: {
        paddingLeft: 20,
        paddingBottom: 15,
    },
    categoryLoadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    // Product Card Styles
    productCard: {
        backgroundColor: '#fff',
        width: 160,
        marginRight: 15,
        borderRadius: 15,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    productImage: {
        width: '100%',
        height: 100,
        resizeMode: 'cover',
        marginBottom: 8,
        borderRadius: 10,
    },
    productBadgeContainer: {
        position: 'absolute',
        top: 8,
        left: 8,
        flexDirection: 'row',
    },
    productSaleBadge: {
        backgroundColor: '#FF3B30',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginRight: 5,
    },
    productLowStockBadge: {
        backgroundColor: '#FF9500',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    productBadgeText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: 'bold',
    },
    productTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
        color: '#333',
    },
    productCategory: {
        fontSize: 12,
        color: '#777',
        marginBottom: 6,
    },
    productPriceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    productOldPrice: {
        color: '#aaa',
        textDecorationLine: 'line-through',
        fontSize: 11,
        marginRight: 5,
    },
    productPrice: {
        color: appColors.Hover_Button,
        fontWeight: 'bold',
        fontSize: 14,
    },
    productAddBtn: {
        backgroundColor: appColors.Primary_Button,
        paddingVertical: 6,
        borderRadius: 8,
        marginTop: 5,
    },
    productAddText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: '600',
        fontSize: 12,
    },
    dealCard: {
        width: 280,
        marginRight: 15,
        borderRadius: 20,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 8,
        overflow: 'hidden',
    },
    dealImageContainer: {
        height: 120,
        width: '100%',
        position: 'relative',
    },
    dealImage: {
        width: '100%',
        height: '100%',
    },
    gradientOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 40,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    dealBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: appColors.Hover_Button,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 15,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#FF5722',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    dealBadgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700',
    },
    sparkle: {
        marginLeft: 4,
    },
    sparkleText: {
        fontSize: 10,
    },
    dealInfo: {
        padding: 15,
    },
    dealTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginBottom: 8,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 10,
    },
    currentPrice: {
        fontSize: 20,
        fontWeight: '800',
        color: appColors.Hover_Button,
        marginRight: 8,
    },
    originalPrice: {
        fontSize: 14,
        color: '#999',
        textDecorationLine: 'line-through',
    },
    dealMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    savingsPill: {
        backgroundColor: appColors.Hover_Button,
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    savingsText: {
        fontSize: 11,
        color: "white",
        fontWeight: '700',
        marginLeft: 4,
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timerText: {
        fontSize: 11,
        color: "#FF5722",
        marginLeft: 4,
        fontWeight: '600',
    },
    dealActionBtn: {
        backgroundColor: appColors.Primary_Button,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        shadowColor: appColors.lightBg,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    dealActionText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
        marginRight: 6,
    },
    noDealsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 50,
    },
    noDealsText: {
        fontSize: 16,
        color: '#999',
        marginTop: 15,
        textAlign: 'center',
        fontWeight: '500',
    },
    bottomSpacing: {
        height: 30,
    },
});

export default Home;