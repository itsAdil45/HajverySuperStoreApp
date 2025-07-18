import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import useGet from '../hooks/useGet';


const CategoryProductsScreen = ({ navigation, route }) => {
    const { mainCategoryID } = route.params || {};

    // Fetch subcategories from API
    const { data, loading, error, refetch } = useGet(`/categories/sub_by_main/${mainCategoryID}`);

    const [subcategories, setSubcategories] = useState([]);
    const [selectedSubcat, setSelectedSubcat] = useState('');

    // Fetch products using useGet hook
    const {
        data: productsData,
        loading: productsLoading,
        error: productsError,
        refetch: refetchProducts
    } = useGet(`/products?category=${encodeURIComponent(selectedSubcat)}`);

    useEffect(() => {
        if (data && data.subCategories) {
            const subcatNames = data.subCategories.map(subcat => subcat.name);
            setSubcategories(subcatNames);
            // Set the first subcategory as selected by default
            if (subcatNames.length > 0) {
                setSelectedSubcat(subcatNames[0]);
            }
        }
    }, [data]);

    const getPriceDisplay = (product) => {
        if (product.variants && product.variants.length > 0) {
            // Get price range from variants
            const prices = product.variants.map(variant => {
                return variant.salePrice || variant.price;
            });
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);

            if (minPrice === maxPrice) {
                return `Rs${minPrice}`;
            }
            return `Rs${minPrice}-Rs${maxPrice}`;
        }

        // Single product price
        return product.salePrice ? `Rs${product.salePrice}` : `Rs${product.price}`;
    };

    const getMRPDisplay = (product) => {
        if (product.variants && product.variants.length > 0) {
            // Get original price range from variants
            const prices = product.variants.map(variant => variant.price);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);

            if (minPrice === maxPrice) {
                return `$${minPrice}`;
            }
            return `Rs${minPrice}-Rs${maxPrice}`;
        }

        // Single product MRP
        return `Rs${product.price}`;
    };

    const getVariantInfo = (product) => {
        if (product.variants && product.variants.length > 0) {
            return product.variants.map(variant => variant.name).join(', ');
        }
        return 'Standard';
    };

    const renderProduct = ({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("Product", { productId: item._id })}>
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: item.images[0] }}
                    style={styles.image}
                    resizeMode="cover"
                />
                {item.isOnSale && (
                    <View style={styles.saleTag}>
                        <Text style={styles.saleText}>SALE</Text>
                    </View>
                )}
            </View>
            <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.brand}>{item.brand}</Text>
            <Text style={styles.qty}>{getVariantInfo(item)}</Text>
            <View style={styles.priceRow}>
                {(item.isOnSale || item.salePrice) && (
                    <Text style={styles.mrp}>{getMRPDisplay(item)}</Text>
                )}
                <Text style={[styles.price, item.isOnSale && styles.salePrice]}>
                    {getPriceDisplay(item)}
                </Text>
            </View>
            <TouchableOpacity style={styles.addButton}>
                <Text style={styles.addText}>Add</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    // Handle loading state
    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Feather name="chevron-left" size={24} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Loading...</Text>
                    <Feather name="search" size={20} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text style={styles.loadingText}>Loading subcategories...</Text>
                </View>
            </View>
        );
    }

    // Handle error state
    if (error) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Feather name="chevron-left" size={24} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Error</Text>
                    <Feather name="search" size={20} />
                </View>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Failed to load subcategories</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Feather name="chevron-left" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Categories</Text>
                <Feather name="search" size={20} />
            </View>

            <View style={styles.body}>
                {/* Left Subcategory List */}
                <FlatList
                    data={subcategories}
                    keyExtractor={(item, index) => `${item}-${index}`}
                    style={styles.sidebar}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => setSelectedSubcat(item)}
                            style={[
                                styles.sidebarItem,
                                selectedSubcat === item && styles.activeSidebarItem,
                                { width: 100 }
                            ]}
                        >
                            <Text
                                style={[
                                    styles.sidebarText,
                                    selectedSubcat === item && styles.activeSidebarText,
                                ]}
                            >
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptySubcatContainer}>
                            <Text style={styles.emptySubcatText}>No subcategories found</Text>
                        </View>
                    }
                />

                {/* Right Product Grid */}
                <View style={{ flex: 1 }}>
                    {productsLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#0000ff" />
                            <Text style={styles.loadingText}>Loading products...</Text>
                        </View>
                    ) : productsError ? (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>Failed to load products</Text>
                            <TouchableOpacity style={styles.retryBtn} onPress={() => refetchProducts()}>
                                <Text style={styles.retryText}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <FlatList
                            data={productsData || []}
                            keyExtractor={item => item._id}
                            renderItem={renderProduct}
                            numColumns={2}
                            contentContainerStyle={styles.productList}
                            columnWrapperStyle={{ justifyContent: 'space-between' }}
                            showsVerticalScrollIndicator={true}
                            ListEmptyComponent={
                                <View style={styles.emptyProductContainer}>
                                    <Text style={styles.emptyText}>
                                        {selectedSubcat ? `No items in ${selectedSubcat}` : 'Select a subcategory to view products'}
                                    </Text>
                                </View>
                            }
                        />
                    )}
                </View>
            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: { fontWeight: 'bold', fontSize: 16 },

    body: { flex: 1, flexDirection: 'row' },
    sidebar: {
        borderRightWidth: 1,
        borderRightColor: '#eee',
        paddingVertical: 10,
        flexGrow: 0
    },
    sidebarItem: {
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderLeftWidth: 3,
        borderLeftColor: 'transparent',
    },
    activeSidebarItem: {
        borderLeftColor: '#00C851',
        backgroundColor: '#F1FFF2',
    },
    sidebarText: {
        fontSize: 12,
        color: '#444',
    },
    activeSidebarText: {
        fontWeight: 'bold',
        color: '#00C851',
    },

    productList: {
        padding: 10,
        flexGrow: 1,
    },
    card: {
        backgroundColor: '#fff',
        width: '48%',
        marginBottom: 15,
        borderRadius: 12,
        padding: 10,
        elevation: 1,
    },
    image: {
        width: '100%',
        height: 100,
        resizeMode: 'contain',
        marginBottom: 8,
    },
    name: { fontSize: 13, fontWeight: '600' },
    qty: { fontSize: 12, color: '#777' },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 5,
    },
    mrp: {
        fontSize: 12,
        textDecorationLine: 'line-through',
        color: '#aaa',
    },
    price: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#00C851',
    },
    addButton: {
        backgroundColor: '#00C851',
        paddingVertical: 6,
        borderRadius: 8,
    },
    addText: {
        textAlign: 'center',
        color: '#fff',
        fontWeight: '600',
    },
    emptyText: {
        textAlign: 'center',
        color: '#aaa',
        fontStyle: 'italic',
        marginTop: 30,
    },
    imageContainer: {
        position: 'relative',
    },
    saleTag: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#ff4444',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        zIndex: 1,
    },
    saleText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    brand: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    salePrice: {
        color: '#ff4444',
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: '#ff4444',
        textAlign: 'center',
        marginBottom: 10,
    },
    retryBtn: {
        backgroundColor: '#007bff',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
    },
    retryText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default CategoryProductsScreen;
