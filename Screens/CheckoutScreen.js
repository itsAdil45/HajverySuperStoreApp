import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    ScrollView,
    View,
    Text,
    Image,
    TouchableOpacity,
    FlatList,
    Modal,
    ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useGet from '../hooks/useGet';
import usePost from '../hooks/usePost';
import usePatch from '../hooks/usePatch';
import useDelete from '../hooks/useDelete';
import axios from 'axios';
import { CartPageSkeleton } from '../skeletons/CartPageSkeleton';
import appColors from '../colors/appColors';
import Toast from 'react-native-toast-message';

const baseUrl = 'https://hajverystorebackend.onrender.com/api';

export default function CheckoutScreen() {
    const navigation = useNavigation();

    // All hooks must be called at the top level
    const { data: cartData, loading: cartLoading, error: cartError, refetch: refetchCart } = useGet('/cart');
    const { post, loading: postLoading } = usePost();
    const { patch, loading: patchLoading } = usePatch();
    const { deleteRequest, loading: deleteLoading } = useDelete();

    const [localCartItems, setLocalCartItems] = useState([]);
    const [localSummary, setLocalSummary] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);

    // Helper function to check if error is network-related
    const isNetworkError = useCallback((error) => {
        if (!error) return false;

        // Handle different error formats
        let errorMessage = '';
        if (typeof error === 'string') {
            errorMessage = error.toLowerCase();
        } else if (error.message) {
            errorMessage = error.message.toLowerCase();
        } else if (error.toString) {
            errorMessage = error.toString().toLowerCase();
        }

        return errorMessage.includes('network') ||
            errorMessage.includes('connection') ||
            errorMessage.includes('offline') ||
            errorMessage.includes('fetch');
    }, []);

    // Helper function to get error message safely
    const getErrorMessage = useCallback((error) => {
        if (!error) return 'An unknown error occurred';

        if (typeof error === 'string') {
            return error;
        }

        if (error.message) {
            return error.message;
        }

        if (error.toString && typeof error.toString === 'function') {
            return error.toString();
        }

        return 'An error occurred';
    }, []);

    useEffect(() => {
        if (cartData?.cart) {
            setLocalCartItems(cartData.cart);
            setLocalSummary(cartData.summary);
        }
    }, [cartData]);

    const cartCategories = useMemo(() => {
        if (!localCartItems || localCartItems.length === 0) return [];
        const categories = localCartItems.map(item => {
            if (item.itemType === 'product') {
                return item.product.brand;
            } else if (item.itemType === 'deal') {
                return item.deal.products.map(product => product.brand);
            }
            return null;
        }).flat().filter(Boolean);

        return [...new Set(categories)];
    }, [localCartItems]);

    const updateLocalQuantity = useCallback((cartItemId, newQuantity) => {
        setLocalCartItems(prevItems => {
            const updatedItems = prevItems.map(item => {
                if (item._id === cartItemId) {
                    return { ...item, quantity: newQuantity };
                }
                return item;
            });

            const newTotalQuantity = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
            const newTotal = updatedItems.reduce((sum, item) => {
                if (item.itemType === 'deal') {
                    return sum + (item.deal.dealPrice * item.quantity);
                } else {
                    return sum + (item.variant.currentPrice * item.quantity);
                }
            }, 0);

            setLocalSummary(prev => ({
                ...prev,
                totalQuantity: newTotalQuantity,
                total: newTotal
            }));

            return updatedItems;
        });
    }, []);

    const removeFromLocalCart = useCallback((cartItemId) => {
        setLocalCartItems(prevItems => {
            const filteredItems = prevItems.filter(item => item._id !== cartItemId);

            const newTotalQuantity = filteredItems.reduce((sum, item) => sum + item.quantity, 0);
            const newTotal = filteredItems.reduce((sum, item) => {
                if (item.itemType === 'deal') {
                    return sum + (item.deal.dealPrice * item.quantity);
                } else {
                    return sum + (item.variant.currentPrice * item.quantity);
                }
            }, 0);

            setLocalSummary(prev => ({
                ...prev,
                totalQuantity: newTotalQuantity,
                total: newTotal
            }));

            return filteredItems;
        });
    }, []);

    const addToLocalCart = useCallback((product, variantName = 'Default') => {
        const newItem = {
            _id: `temp_${Date.now()}`,
            itemType: 'product',
            product: product,
            variant: product.variants.find(v => v.name === variantName) || product.variants[0],
            quantity: 1
        };

        setLocalCartItems(prevItems => {
            const updatedItems = [...prevItems, newItem];

            const newTotalQuantity = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
            const newTotal = updatedItems.reduce((sum, item) => {
                if (item.itemType === 'deal') {
                    return sum + (item.deal.dealPrice * item.quantity);
                } else {
                    return sum + (item.variant.currentPrice * item.quantity);
                }
            }, 0);

            setLocalSummary(prev => ({
                ...prev,
                totalQuantity: newTotalQuantity,
                total: newTotal
            }));

            return updatedItems;
        });
    }, []);

    useFocusEffect(
        useCallback(() => {
            refetchCart();
        }, [refetchCart]),
    );

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (cartCategories.length === 0) return;

            setLoadingRecommendations(true);
            try {
                const response = await axios.get(`${baseUrl}/products?brand=${cartCategories[0]}`);
                if (response.data) {
                    const filtered = response.data?.products.slice(0, 4) || [];
                    setRecommendations(filtered);
                }
            } catch (error) {
                console.error('Error fetching recommendations:', error);
            } finally {
                setLoadingRecommendations(false);
            }
        };

        fetchRecommendations();
    }, [cartCategories]);

    const removeFromCart = useCallback(async (cartItemId) => {
        removeFromLocalCart(cartItemId);

        try {
            const result = await deleteRequest(`/api/cart/remove/${cartItemId}`, true);
            if (!result) {
                refetchCart();
            }
        } catch (error) {
            console.error('Error removing from cart:', error);
            refetchCart();

            // Show error toast for network issues
            if (isNetworkError(error)) {
                Toast.show({
                    type: 'error',
                    text1: 'Connection Error',
                    text2: 'Please check your internet connection',
                    position: 'top',
                });
            }
        }
    }, [removeFromLocalCart, deleteRequest, refetchCart, isNetworkError]);

    const updateQuantity = useCallback(async (cartItemId, newQuantity) => {
        if (newQuantity <= 0) {
            Toast.show({
                type: 'info',
                text1: 'Remove Item',
                text2: 'Item has been removed from your cart',
                position: 'top',
            });
            removeFromCart(cartItemId);
            return;
        }

        updateLocalQuantity(cartItemId, newQuantity);

        try {
            const result = await patch(`/api/cart/update/${cartItemId}`, { quantity: newQuantity });
            if (!result) {
                refetchCart();
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
            refetchCart();

            // Show error toast for network issues
            if (isNetworkError(error)) {
                Toast.show({
                    type: 'error',
                    text1: 'Connection Error',
                    text2: 'Please check your internet connection',
                    position: 'top',
                });
            }
        }
    }, [updateLocalQuantity, patch, refetchCart, isNetworkError, removeFromCart]);

    const addToCart = useCallback(async (product, variantName = 'Default') => {
        addToLocalCart(product, variantName);

        try {
            const result = await post('/api/cart/add', {
                itemType: 'product',
                productId: product._id,
                quantity: 1,
                variantName: variantName
            }, true);

            if (result) {
                Toast.show({
                    type: 'success',
                    text1: 'Item Added',
                    text2: 'The item has been added to your cart.',
                    position: 'top',
                });
                refetchCart();
            } else {
                refetchCart();
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            refetchCart();

            // Show error toast for network issues
            if (isNetworkError(error)) {
                Toast.show({
                    type: 'error',
                    text1: 'Connection Error',
                    text2: 'Please check your internet connection',
                    position: 'top',
                });
            }
        }
    }, [addToLocalCart, post, refetchCart, isNetworkError]);

    const renderDealProducts = useCallback((products) => {
        return products.map((product, index) => (
            <View key={`${product._id}-${index}`} style={styles.dealProduct}>
                <Image
                    source={{ uri: product.images[0] }}
                    style={styles.dealProductImage}
                />
                <View style={styles.dealProductInfo}>
                    <Text style={styles.dealProductName} numberOfLines={1}>{product.name}</Text>
                    <Text style={styles.dealProductBrand}>{product.brand}</Text>
                    <Text style={styles.dealProductVariant}>{product.variantName}</Text>
                </View>
            </View>
        ));
    }, []);

    const renderCartItem = useCallback((item) => {
        if (item.itemType === 'deal') {
            return (
                <View style={styles.cartItem} key={item._id}>
                    <Image
                        source={{ uri: item.deal.bannerImage }}
                        style={styles.cartImage}
                    />
                    <View style={{ flex: 1 }}>
                        <View style={styles.dealHeader}>
                            <Text style={styles.dealBadge}>DEAL</Text>
                        </View>
                        <Text style={styles.cartTitle}>{item.deal.title}</Text>
                        <Text style={styles.dealDescription} numberOfLines={2}>
                            {item.deal.description}
                        </Text>

                        <View style={styles.dealProductsContainer}>
                            <Text style={styles.dealProductsLabel}>Includes:</Text>
                            {renderDealProducts(item.deal.products)}
                        </View>

                        <View style={styles.dealPricing}>
                            <View>
                                <View style={styles.priceRow}>
                                    <Text style={styles.cartPrice}>Rs{item.deal.dealPrice.toFixed(2)}</Text>
                                    <Text style={styles.oldPrice}>Rs{item.deal.originalPrice.toFixed(2)}</Text>
                                </View>
                                <Text style={styles.savingsText}>
                                    Save Rs{item.deal.savings.toFixed(2)} ({item.deal.savingsPercentage}% off)
                                </Text>
                            </View>
                        </View>
                        <View style={styles.qtyRow}>
                            <TouchableOpacity
                                onPress={() => updateQuantity(item._id, item.quantity - 1)}
                                disabled={patchLoading || deleteLoading}
                            >
                                <Text style={styles.qtyBtn}>-</Text>
                            </TouchableOpacity>
                            <Text style={styles.qtyText}>{item.quantity}</Text>
                            <TouchableOpacity
                                onPress={() => updateQuantity(item._id, item.quantity + 1)}
                                disabled={patchLoading || deleteLoading}
                            >
                                <Text style={styles.qtyBtn}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.cartItem} key={item._id}>
                <Image
                    source={{ uri: item.product.images[0] }}
                    style={styles.cartImage}
                />
                <View style={{ flex: 1 }}>
                    <Text style={styles.cartTitle}>{item.product.name}</Text>
                    <Text style={{ color: "#777" }}>{item.variant.name}</Text>
                    <Text style={{ color: "#777" }}>Brand: {item.product.brand}</Text>
                    <View style={{
                        display: "flex",
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: "center"
                    }}>
                        <View>
                            <Text style={styles.cartPrice}>Rs{item.variant.currentPrice}</Text>
                            {item.variant.isOnSale && (
                                <Text style={styles.oldPrice}>Rs{item.variant.price}</Text>
                            )}
                        </View>

                        <View style={styles.qtyRow}>
                            <TouchableOpacity
                                onPress={() => updateQuantity(item._id, item.quantity - 1)}
                                disabled={patchLoading || deleteLoading}
                            >
                                <Text style={styles.qtyBtn}>-</Text>
                            </TouchableOpacity>
                            <Text style={styles.qtyText}>{item.quantity}</Text>
                            <TouchableOpacity
                                onPress={() => updateQuantity(item._id, item.quantity + 1)}
                                disabled={patchLoading || deleteLoading}
                            >
                                <Text style={styles.qtyBtn}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        );
    }, [updateQuantity, patchLoading, deleteLoading, renderDealProducts]);

    const renderRecommendationItem = useCallback(({ item }) => (
        <TouchableOpacity style={styles.recommendCard} onPress={() => navigation.navigate("Product", { productId: item._id })}>
            <Image
                source={{ uri: item.images[0] }}
                style={styles.recommendImage}
            />
            <Text numberOfLines={2} style={styles.recommendTitle}>{item.name}</Text>
            <Text style={{ color: "#777" }}>{item.brand}</Text>
            <View style={styles.priceRow}>
                <Text style={styles.recommendPrice}>
                    Rs{item.variants?.[0]?.currentPrice || item.variants?.[0]?.price}
                </Text>
                {item.variants?.[0]?.isOnSale && (
                    <Text style={styles.recommendOldPrice}>
                        Rs{item.variants?.[0]?.price}
                    </Text>
                )}
            </View>
            {/* <TouchableOpacity
                style={styles.addBtn}
                onPress={() => addToCart(item)}
                disabled={postLoading}
            >
                <Text style={styles.addBtnText}>
                    {postLoading ? 'Adding...' : 'Add'}
                </Text>
            </TouchableOpacity> */}
        </TouchableOpacity>
    ), [navigation, addToCart, postLoading]);

    // Conditional rendering based on states
    if (cartLoading && localCartItems.length === 0) {
        return <CartPageSkeleton itemCount={3} />;
    }

    if (cartError) {
        const errorMessage = getErrorMessage(cartError);
        const isNetworkIssue = isNetworkError(cartError);

        return (
            <View style={styles.errorContainer}>
                <View style={styles.errorContent}>
                    {isNetworkIssue ? (
                        <>
                            <Text style={styles.errorIcon}>📶</Text>
                            <Text style={styles.errorTitle}>Connection Problem</Text>
                            <Text style={styles.errorMessage}>
                                Please check your internet connection and try again.
                            </Text>
                        </>
                    ) : (
                        <>
                            <Text style={styles.errorIcon}>⚠️</Text>
                            <Text style={styles.errorTitle}>Something went wrong</Text>
                            <Text style={styles.errorMessage}>
                                {errorMessage}
                            </Text>
                        </>
                    )}

                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={refetchCart}
                    >
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.goBackButton}
                        onPress={() => navigation.navigate('CategoryTab')}
                    >
                        <Text style={styles.goBackButtonText}>Go to Categories</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    if (!localCartItems || localCartItems.length === 0) {
        return (
            <View style={styles.emptyCartContainer}>
                <Text style={styles.emptyCartText}>Your cart is empty</Text>
                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => navigation.navigate('CategoryTab')}
                >
                    <Text style={styles.addBtnText}>Continue Shopping</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {localCartItems.map(renderCartItem)}

            <Text style={styles.subheading}>Before you Checkout</Text>
            {loadingRecommendations ? (
                <ActivityIndicator size="small" color={appColors.darkerBg} style={{ margin: 20 }} />
            ) : (
                <FlatList
                    horizontal
                    data={recommendations}
                    keyExtractor={(item) => item._id}
                    renderItem={renderRecommendationItem}
                    showsHorizontalScrollIndicator={false}
                />
            )}

            <TouchableOpacity style={styles.couponRow}>
                <Text style={{ color: "#777" }}>🧾  APPLY COUPON</Text>
                <Text>{'>'}</Text>
            </TouchableOpacity>

            {localSummary && (
                <View style={styles.summary}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryText}>Items ({localSummary.totalQuantity}):</Text>
                        <Text style={styles.summaryText}>Rs{localSummary.total.toFixed(2)}</Text>
                    </View>

                    {localSummary.breakdown && (
                        <View style={styles.breakdownContainer}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.breakdownText}>• Products: {localSummary.breakdown.products}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.breakdownText}>• Deals: {localSummary.breakdown.deals}</Text>
                            </View>
                        </View>
                    )}

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryText}>Discount:</Text>
                        <Text style={styles.summaryText}>Rs0.00</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryText}>Delivery:</Text>
                        <Text style={{ color: 'green' }}>Rs 50</Text>
                    </View>

                    <Text style={styles.summaryTotal}>
                        Grand Total: Rs{(localSummary.total + 50).toFixed(2)}
                    </Text>
                </View>
            )}

            <TouchableOpacity
                style={[styles.checkoutBtn, (patchLoading || postLoading || deleteLoading) && { opacity: 0.7 }]}
                disabled={patchLoading || postLoading || deleteLoading}
                onPress={() => navigation.navigate("Payment", { total: (localSummary?.total + 50).toFixed(2) })}
            >
                <Text style={styles.checkoutText}>
                    Rs{(localSummary?.total + 50).toFixed(2)}   |   Place Order
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = {
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    // Error handling styles
    errorContainer: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorContent: {
        alignItems: 'center',
        maxWidth: 300,
    },
    errorIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
        textAlign: 'center',
    },
    errorMessage: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    retryButton: {
        backgroundColor: appColors.Primary_Button,
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 8,
        marginBottom: 12,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    goBackButton: {
        backgroundColor: 'transparent',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: appColors.Primary_Button,
    },
    goBackButtonText: {
        color: appColors.Primary_Button,
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Empty cart styles
    emptyCartContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyCartText: {
        fontSize: 18,
        color: '#777',
        marginBottom: 20,
    },
    // Existing styles
    cartItem: {
        flexDirection: 'row',
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
    },
    cartImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginRight: 15,
    },
    cartTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        color: appColors.Primary_Button
    },
    cartPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: appColors.darkerBg,
    },
    oldPrice: {
        fontSize: 14,
        textDecorationLine: 'line-through',
        color: '#999',
        marginLeft: 8,
    },
    qtyRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    qtyBtn: {
        fontSize: 20,
        fontWeight: 'bold',
        paddingHorizontal: 12,
        paddingVertical: 5,
        backgroundColor: '#e0e0e0',
        textAlign: 'center',
        color: appColors.Primary_Button,
        minWidth: 35,
    },
    qtyText: {
        fontSize: 16,
        paddingHorizontal: 15,
        color: appColors.Primary_Button,
    },
    dealHeader: {
        marginBottom: 5,
    },
    dealBadge: {
        backgroundColor: '#FF6B35',
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        alignSelf: 'flex-start',
    },
    dealDescription: {
        color: '#777',
        fontSize: 12,
        marginBottom: 8,
    },
    dealProductsContainer: {
        marginBottom: 10,
    },
    dealProductsLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    dealProduct: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 3,
    },
    dealProductImage: {
        width: 20,
        height: 20,
        borderRadius: 4,
        marginRight: 8,
    },
    dealProductInfo: {
        flex: 1,
    },
    dealProductName: {
        fontSize: 11,
        fontWeight: '600',
        color: '#333',
    },
    dealProductBrand: {
        fontSize: 10,
        color: '#777',
    },
    dealProductVariant: {
        fontSize: 10,
        color: '#999',
    },
    dealPricing: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    savingsText: {
        fontSize: 12,
        color: '#FF6B35',
        fontWeight: '600',
        marginTop: 2,
    },
    subheading: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 20,
        color: "#777"
    },
    recommendCard: {
        width: 150,
        backgroundColor: '#f8f8f8',
        padding: 10,
        borderRadius: 10,
        marginRight: 15,
    },
    recommendImage: {
        width: '100%',
        height: 80,
        borderRadius: 8,
        marginBottom: 8,
    },
    recommendTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
        color: appColors.Primary_Button
    },
    recommendPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: appColors.darkerBg,
        marginRight: 8,
    },
    recommendOldPrice: {
        fontSize: 12,
        textDecorationLine: 'line-through',
        color: '#999',
    },
    addBtn: {
        backgroundColor: appColors.Primary_Button,
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 5,
        paddingHorizontal: 20
    },
    addBtnText: {
        color: 'white',
        fontWeight: 'bold',
    },
    couponRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 10,
        marginVertical: 20,
    },
    summary: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        marginBottom: 8,
    },
    summaryText: {
        fontSize: 16,
        color: "#777"
    },
    breakdownContainer: {
        paddingLeft: 10,
        marginBottom: 5,
    },
    breakdownText: {
        fontSize: 14,
        color: '#666',
    },
    summaryTotal: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        color: appColors.darkerBg
    },
    checkoutBtn: {
        backgroundColor: appColors.Primary_Button,
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    checkoutText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
};