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
    ActivityIndicator
} from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import useGet from '../hooks/useGet';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Home = ({ navigation }) => {
    const { data: categoriesData, loading: categoriesLoading, error: categoriesError, refetch: refetchCategories } = useGet('/categories/all_main');
    const { data: dealsData, loading: dealsLoading, error: dealsError, refetch: refetchDeals } = useGet('/deals');

    const [categories, setCategories] = useState([]);
    const [deals, setDeals] = useState([]);
    const [keyword, setKeyword] = useState('');
    const { user } = useAuth();

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

    const formatPrice = (price) => {
        return `$${price.toFixed(2)}`;
    };

    const calculateSavings = (originalPrice, dealPrice) => {
        const savings = originalPrice - dealPrice;
        const percentage = Math.round((savings / originalPrice) * 100);
        return { savings: formatPrice(savings), percentage };
    };

    if (categoriesLoading || dealsLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00C851" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    if (categoriesError || dealsError) {
        return (
            <View style={styles.errorContainer}>
                <MaterialIcons name="error-outline" size={48} color="#FF5252" />
                <Text style={styles.errorText}>Something went wrong</Text>
                <TouchableOpacity
                    style={styles.retryBtn}
                    onPress={() => {
                        refetchCategories();
                        refetchDeals();
                    }}
                >
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const renderDealCard = ({ item }) => {
        const dealProduct = item.products[0]?.product;
        const savings = calculateSavings(item.originalPrice, item.dealPrice);

        return (
            <TouchableOpacity
                style={styles.dealCard}
                activeOpacity={0.9}
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
                </View>

                {/* Deal Info - Compact Layout */}
                <View style={styles.dealInfo}>
                    <Text style={styles.dealTitle} numberOfLines={1}>{item.title}</Text>

                    {/* Price Row */}
                    <View style={styles.priceRow}>
                        <Text style={styles.currentPrice}>{formatPrice(item.dealPrice)}</Text>
                        <Text style={styles.originalPrice}>{formatPrice(item.originalPrice)}</Text>
                    </View>

                    {/* Savings & Timer */}
                    <View style={styles.dealMeta}>
                        <View style={styles.savingsPill}>
                            <Text style={styles.savingsText}>Save {savings.savings}</Text>
                        </View>
                        <View style={styles.timerContainer}>
                            <MaterialIcons name="access-time" size={12} color="#FF5722" />
                            <Text style={styles.timerText}>
                                {new Date(item.validUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };
    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.locationTitle}>Home</Text>
                    <Text style={styles.locationText}>
                        {user?.address?.split("+")[0]?.trim() || 'Select Location'}
                    </Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate("CartTab")}>
                    <Feather name="shopping-cart" size={22} color="#000" />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <TextInput
                        placeholder="Search products..."
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
                    <Ionicons name="search" size={18} color="#fff" />
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
                {categories && categories.length > 0 ? (
                    categories.map((cat, key) => (
                        <TouchableOpacity
                            key={cat.id || key}
                            style={styles.categoryItem}
                            onPress={() => navigation.navigate("CategoryProducts", { mainCategoryID: cat._id })}
                        >
                            <Image source={{ uri: cat.icon }} style={styles.categoryIcon} />
                            <Text style={styles.categoryText}>{cat.name}</Text>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={styles.noCategoriesContainer}>
                        <Text style={styles.noCategoriesText}>No categories available</Text>
                    </View>
                )}
            </ScrollView>

            {/* Banner */}
            <View style={styles.banner}>
                <Text style={styles.bannerTitle}>
                    World Food Festival,{"\n"}Bring the world to your Kitchen!
                </Text>
                <TouchableOpacity style={styles.shopNowBtn}>
                    <Text style={styles.shopNowText}>Shop Now</Text>
                </TouchableOpacity>
                <Image source={require('../assets/cat1.png')} style={styles.bannerImage} />
            </View>

            {/* Hot Deals Section */}
            <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                    <MaterialIcons name="local-fire-department" size={20} color="#FF5722" />
                    <Text style={styles.sectionTitle}>Hot Deals</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('DealsTab')}>
                    <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
            </View>

            {deals && deals.length > 0 ? (
                <FlatList
                    data={deals}
                    keyExtractor={item => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.dealsContainer}
                    renderItem={renderDealCard}
                />
            ) : (
                <View style={styles.noDealsContainer}>
                    <MaterialIcons name="local-offer" size={48} color="#ccc" />
                    <Text style={styles.noDealsText}>No active deals at the moment</Text>
                </View>
            )}
        </ScrollView>
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
        padding: 35,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    locationTitle: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    locationText: {
        fontSize: 12,
        color: '#888'
    },
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
        paddingTop: 20,
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionTitle: {
        fontWeight: 'bold',
        fontSize: 18,
        marginLeft: 5,
    },
    seeAll: {
        color: '#00C851',
        fontSize: 14,
        fontWeight: '600',
    },
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
        fontWeight: '500',
    },
    noCategoriesContainer: {
        padding: 20,
        alignItems: 'center',
    },
    noCategoriesText: {
        color: '#999',
        fontSize: 14,
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
    shopNowText: {
        color: '#fff',
        fontWeight: 'bold'
    },
    bannerImage: {
        position: 'absolute',
        right: 10,
        bottom: 0,
        width: 100,
        height: 100,
        resizeMode: 'contain',
    },
    dealsContainer: {
        paddingLeft: 15,
        paddingBottom: 10,
    },
    dealCard: {
        width: 260,
        marginRight: 12,
        borderRadius: 12,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
        borderWidth: 0.5,
        borderColor: '#f0f0f0',
    },
    dealBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#FF5722',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    dealBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    dealImageContainer: {
        height: 100,
        width: '100%',
        position: 'relative',
    },
    dealImage: {
        width: '100%',
        height: '100%',
    },
    dealOverlay: {
        position: 'absolute',
        bottom: 10,
        left: 15,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    dealLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#FF5722',
        marginLeft: 4,
    },
    dealInfo: {
        padding: 10,
    },
    dealTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
        marginBottom: 6,
    },
    dealDescription: {
        fontSize: 11,
        color: '#666',
        marginBottom: 8,
    },
    productName: {
        fontSize: 12,
        color: '#888',
        fontStyle: 'italic',
        marginBottom: 12,
    },
    priceSection: {
        marginBottom: 12,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 6,
    },
    currentPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#00C851',
        marginRight: 6,
    },
    originalPrice: {
        fontSize: 12,
        color: '#999',
        textDecorationLine: 'line-through',
    },
    dealMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    savingsPill: {
        backgroundColor: '#FFF0E5',
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 3,
    },
    savingsText: {
        fontSize: 10,
        color: '#FF5722',
        fontWeight: '600',
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timerText: {
        fontSize: 10,
        color: '#FF5722',
        marginLeft: 2,
        fontWeight: '500',
    },
    dealActionBtn: {
        backgroundColor: '#00C851',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 15,
    },
    dealActionText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        marginRight: 8,
    },
    noDealsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,

    },
    noDealsText: {
        fontSize: 16,
        color: '#999',
        marginTop: 10,
        textAlign: 'center',
    },
});

export default Home;