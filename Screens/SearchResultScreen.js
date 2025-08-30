import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    ScrollView,
    TextInput
} from 'react-native';
import { Feather, MaterialIcons, AntDesign } from '@expo/vector-icons';
import useGet from '../hooks/useGet';
import Slider from '@react-native-community/slider';
import appColors from '../colors/appColors';

const SearchResultScreen = ({ route, navigation }) => {
    // Extract search parameter first
    const { search, hasActiveSale } = route.params || {};

    // Initialize searchParams with the route parameter to prevent double API call
    const [searchParams, setSearchParams] = useState(search || '');
    const [showFilters, setShowFilters] = useState(false);
    const [priceRange, setPriceRange] = useState([0, 100]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [sortOption, setSortOption] = useState('relevance');
    const [searchText, setSearchText] = useState(search || '');

    // Remove the useEffect that was causing the double call
    // useEffect(() => {
    //     setSearchParams(search)
    // }, [])
    let url = '';

    if (!hasActiveSale) {
        url = `/products?search=${encodeURIComponent(searchParams)}`;
    }
    else {
        url = `/products?hasActiveSale=${hasActiveSale}`;
    }
    const { data, loading, error, refetch } = useGet(url);

    // Extract unique categories and brands from data for filters
    const categories = [...new Set(data?.map(item => item.category?.sub).filter(Boolean))];
    const brands = [...new Set(data?.map(item => item.brand).filter(Boolean))];

    const filteredData = data?.filter(item => {
        const priceMatch = item.bestPrice >= priceRange[0] && item.bestPrice <= priceRange[1];
        const categoryMatch = selectedCategories.length === 0 ||
            (item.category?.sub && selectedCategories.includes(item.category.sub));

        // Brand filter
        const brandMatch = selectedBrands.length === 0 ||
            (item.brand && selectedBrands.includes(item.brand));

        return priceMatch && categoryMatch && brandMatch;
    });

    // Sort data based on selected option
    const sortedData = [...(filteredData || [])].sort((a, b) => {
        switch (sortOption) {
            case 'price-low':
                return a.bestPrice - b.bestPrice;
            case 'price-high':
                return b.bestPrice - a.bestPrice;
            case 'newest':
                return new Date(b.createdAt) - new Date(a.createdAt);
            default:
                return 0; // relevance (default order)
        }
    });

    const toggleCategory = (category) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const toggleBrand = (brand) => {
        setSelectedBrands(prev =>
            prev.includes(brand)
                ? prev.filter(b => b !== brand)
                : [...prev, brand]
        );
    };

    const handleSearch = () => {
        setSearchParams(searchText);
        // The useGet hook will automatically refetch when searchParams changes
    };

    const renderItem = ({ item }) => {
        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('Product', { productId: item.id })}
            >
                <Image source={{ uri: item.images?.[0] }} style={styles.image} />
                <View style={styles.badgeContainer}>
                    {item.hasActiveSale && (
                        <View style={styles.saleBadge}>
                            <Text style={styles.badgeText}>SALE</Text>
                        </View>
                    )}
                    {item.stock < 10 && (
                        <View style={styles.lowStockBadge}>
                            <Text style={styles.badgeText}>LOW STOCK</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.qty}>{item.category?.sub}</Text>
                <View style={styles.row}>
                    {item.hasActiveSale && item.variants[0]?.isOnSale ? (
                        <>
                            <Text style={styles.old}>Rs {item.variants[0]?.price.toFixed(2)}</Text>
                            <Text style={styles.price}>Rs {item.bestPrice.toFixed(2)}</Text>
                        </>
                    ) : (
                        <Text style={styles.price}>Rs {item.bestPrice.toFixed(2)}</Text>
                    )}
                </View>
                <TouchableOpacity style={styles.addBtn}>
                    <Text style={styles.addText}>View</Text>
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Search Header */}
            <View style={styles.searchHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="chevron-left" size={24} color="#333" />
                </TouchableOpacity>
                <View style={styles.searchContainer}>
                    <Feather name="search" size={18} color="#777" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search products..."
                        value={searchText}
                        onChangeText={setSearchText}
                        onSubmitEditing={handleSearch}
                        placeholderTextColor="#777"
                    />
                    {searchText ? (
                        <TouchableOpacity onPress={() => setSearchText('')}>
                            <Feather name="x" size={18} color="#777" />
                        </TouchableOpacity>
                    ) : null}
                </View>
                <TouchableOpacity onPress={() => setShowFilters(true)}>
                    <Feather name="filter" size={20} color="#333" />
                </TouchableOpacity>
            </View>

            {/* Results Info Bar */}
            <View style={styles.resultsInfo}>
                <Text style={styles.resultsText}>
                    {sortedData?.length || 0} results
                </Text>
                <TouchableOpacity
                    style={styles.sortButton}
                    onPress={() => setShowFilters(true)}
                >
                    <Text style={styles.sortText}>Sort: {sortOption.replace('-', ' ')}</Text>
                    <Feather name="chevron-down" size={16} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={appColors.darkerBg} />
                    <Text>Loading products...</Text>
                </View>
            ) : error ? (
                <View style={styles.center}>
                    <Text>Error loading products</Text>
                    <TouchableOpacity onPress={refetch}>
                        <Text style={{ color: appColors.darkerBg, marginTop: 10 }}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : sortedData?.length === 0 ? (
                <View style={styles.center}>
                    <Text>No products found</Text>
                    <TouchableOpacity
                        style={styles.clearFiltersButton}
                        onPress={() => {
                            setSelectedCategories([]);
                            setSelectedBrands([]);
                            setPriceRange([0, 100]);
                        }}
                    >
                        <Text style={styles.clearFiltersText}>Clear all filters</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={sortedData}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    numColumns={2}
                    contentContainerStyle={{ padding: 10 }}
                    columnWrapperStyle={{ justifyContent: 'space-between' }}
                    ListHeaderComponent={() => (
                        (selectedCategories.length > 0 || selectedBrands.length > 0) && (
                            <View style={styles.activeFiltersContainer}>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.activeFiltersScroll}
                                >
                                    {selectedCategories.map(category => (
                                        <View key={category} style={styles.activeFilter}>
                                            <Text style={styles.activeFilterText}>{category}</Text>
                                            <TouchableOpacity onPress={() => toggleCategory(category)}>
                                                <Feather name="x" size={14} color="#fff" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                    {selectedBrands.map(brand => (
                                        <View key={brand} style={styles.activeFilter}>
                                            <Text style={styles.activeFilterText}>{brand}</Text>
                                            <TouchableOpacity onPress={() => toggleBrand(brand)}>
                                                <Feather name="x" size={14} color="#fff" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                    <TouchableOpacity
                                        style={styles.clearAllButton}
                                        onPress={() => {
                                            setSelectedCategories([]);
                                            setSelectedBrands([]);
                                        }}
                                    >
                                        <Text style={styles.clearAllText}>Clear all</Text>
                                    </TouchableOpacity>
                                </ScrollView>
                            </View>
                        )
                    )}
                />
            )}

            {/* Filters Modal */}
            <Modal
                visible={showFilters}
                animationType="slide"
                transparent={false}
                onRequestClose={() => setShowFilters(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Filters</Text>
                        <TouchableOpacity onPress={() => setShowFilters(false)}>
                            <Feather name="x" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        {/* Price Range Filter */}
                        <View style={styles.filterSection}>
                            <Text style={styles.filterTitle}>Price Range</Text>
                            <View style={styles.priceRangeValues}>
                                <Text style={{ color: "#777" }}>Rs {priceRange[0].toFixed(2)}</Text>
                                <Text style={{ color: "#777" }}>Rs {priceRange[1].toFixed(2)}</Text>
                            </View>
                            <Slider
                                style={styles.slider}
                                minimumValue={0}
                                maximumValue={100}
                                step={5}
                                minimumTrackTintColor={appColors.Hover_Button}
                                maximumTrackTintColor="#d3d3d3"
                                thumbTintColor={appColors.darkerBg}
                                value={priceRange[1]}
                                onValueChange={(value) => setPriceRange([priceRange[0], value])}
                            />
                        </View>

                        {/* Categories Filter */}
                        {categories.length > 0 && (
                            <View style={styles.filterSection}>
                                <Text style={styles.filterTitle}>Categories</Text>
                                <View style={styles.chipContainer}>
                                    {categories.map(category => (
                                        <TouchableOpacity
                                            key={category}
                                            style={[
                                                styles.chip,
                                                selectedCategories.includes(category) && styles.chipSelected
                                            ]}
                                            onPress={() => toggleCategory(category)}
                                        >
                                            <Text style={[
                                                styles.chipText,
                                                selectedCategories.includes(category) && styles.chipTextSelected
                                            ]}>
                                                {category}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Brands Filter */}
                        {brands.length > 0 && (
                            <View style={styles.filterSection}>
                                <Text style={styles.filterTitle}>Brands</Text>
                                <View style={styles.chipContainer}>
                                    {brands.map(brand => (
                                        <TouchableOpacity
                                            key={brand}
                                            style={[
                                                styles.chip,
                                                selectedBrands.includes(brand) && styles.chipSelected
                                            ]}
                                            onPress={() => toggleBrand(brand)}
                                        >
                                            <Text style={[
                                                styles.chipText,
                                                selectedBrands.includes(brand) && styles.chipTextSelected
                                            ]}>
                                                {brand}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Sort Options */}
                        <View style={styles.filterSection}>
                            <Text style={styles.filterTitle}>Sort By</Text>
                            <View style={styles.radioGroup}>
                                {[
                                    { value: 'relevance', label: 'Relevance' },
                                    { value: 'price-low', label: 'Price: Low to High' },
                                    { value: 'price-high', label: 'Price: High to Low' },
                                    { value: 'newest', label: 'Newest' }
                                ].map(option => (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={styles.radioOption}
                                        onPress={() => setSortOption(option.value)}
                                    >
                                        <View style={[
                                            styles.radioOuter,
                                            sortOption === option.value && styles.radioOuterSelected
                                        ]}>
                                            {sortOption === option.value && (
                                                <View style={styles.radioInner} />
                                            )}
                                        </View>
                                        <Text style={styles.radioLabel}>{option.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={styles.clearButton}
                            onPress={() => {
                                setSelectedCategories([]);
                                setSelectedBrands([]);
                                setPriceRange([0, 100]);
                                setSortOption('relevance');
                            }}
                        >
                            <Text style={styles.clearButtonText}>Reset All</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.applyButton}
                            onPress={() => setShowFilters(false)}
                        >
                            <Text style={styles.applyButtonText}>Apply Filters</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f8f8' },

    // Search Header
    searchHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        marginRight: 10,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f2f2f2',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginRight: 10,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        padding: 0,
        color: "#777"
    },

    // Results Info
    resultsInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#fff',
    },
    resultsText: {
        color: '#666',
        fontSize: 14,
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sortText: {
        marginRight: 4,
        color: '#333',
        fontSize: 14,
    },

    // Product Cards
    card: {
        backgroundColor: '#fff',
        width: '48%',
        marginBottom: 15,
        borderRadius: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    image: {
        width: '100%',
        height: 120,
        resizeMode: 'contain',
        marginBottom: 10,
        borderRadius: 8,
    },
    badgeContainer: {
        position: 'absolute',
        top: 10,
        left: 10,
        flexDirection: 'row',
    },
    saleBadge: {
        backgroundColor: '#FF3B30',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginRight: 5,
    },
    lowStockBadge: {
        backgroundColor: '#FF9500',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
        color: '#333',
    },
    qty: {
        fontSize: 12,
        color: '#777',
        marginBottom: 6,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    old: {
        color: '#aaa',
        textDecorationLine: 'line-through',
        fontSize: 12,
        marginRight: 5,
    },
    price: {
        color: appColors.Hover_Button,
        fontWeight: 'bold',
        fontSize: 16,
    },
    addBtn: {
        backgroundColor: appColors.Primary_Button,
        paddingVertical: 8,
        borderRadius: 8,
        marginTop: 5,
    },
    addText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: '600',
        fontSize: 14,
    },

    // Active Filters
    activeFiltersContainer: {
        backgroundColor: '#fff',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    activeFiltersScroll: {
        paddingHorizontal: 15,
    },
    activeFilter: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: appColors.darkerBg,
        borderRadius: 15,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 8,
    },
    activeFilterText: {
        color: '#fff',
        fontSize: 12,
        marginRight: 6,
    },
    clearAllButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        justifyContent: 'center',
    },
    clearAllText: {
        color: appColors.Hover_Button,
        fontSize: 12,
        fontWeight: '500',
    },

    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: "#777"
    },
    modalContent: {
        flex: 1,
        paddingHorizontal: 20,
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    clearButton: {
        flex: 1,
        padding: 15,
        backgroundColor: '#f2f2f2',
        borderRadius: 10,
        marginRight: 10,
        alignItems: 'center',
    },
    clearButtonText: {
        color: '#333',
        fontWeight: '600',
    },
    applyButton: {
        flex: 1,
        padding: 15,
        backgroundColor: appColors.Primary_Button,
        borderRadius: 10,
        alignItems: 'center',
    },
    applyButtonText: {
        color: '#fff',
        fontWeight: '600',
    },

    // Filter Sections
    filterSection: {
        marginBottom: 25,
    },
    filterTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 15,
        color: '#333',
    },
    priceRangeValues: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        color: '#777',
    },
    slider: {
        width: '100%',
        height: 40,
    },

    // Chips (for categories/brands)
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    chip: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f2f2f2',
        marginRight: 8,
        marginBottom: 8,
    },
    chipSelected: {
        backgroundColor: appColors.darkerBg,
    },
    chipText: {
        fontSize: 14,
        color: '#333',
    },
    chipTextSelected: {
        color: '#fff',
    },

    // Radio Buttons (for sort options)
    radioGroup: {
        marginTop: 5,
        color: "#777"
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    radioOuterSelected: {
        borderColor: appColors.Hover_Button,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: appColors.Primary_Button,
    },
    radioLabel: {
        fontSize: 16,
        color: '#333',
    },

    // Center Loading/Error
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    clearFiltersButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#f2f2f2',
        borderRadius: 5,
    },
    clearFiltersText: {
        color: appColors.Hover_Button,
    },
});

export default SearchResultScreen;