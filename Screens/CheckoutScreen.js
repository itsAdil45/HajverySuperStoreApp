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
    Alert,
    ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useGet from '../hooks/useGet';
import usePost from '../hooks/usePost';
import usePatch from '../hooks/usePatch';
import useDelete from '../hooks/useDelete';
import axios from 'axios';

const baseUrl = 'http://192.168.49.215:5000/api';

export default function CheckoutScreen() {
    const navigation = useNavigation();
    const { data: cartData, loading: cartLoading, error: cartError, refetch: refetchCart } = useGet('/cart');
    const { post, loading: postLoading } = usePost();
    const { patch, loading: patchLoading } = usePatch();
    const { deleteRequest, loading: deleteLoading } = useDelete();

    const [recommendations, setRecommendations] = useState([]);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);

    const cartCategories = useMemo(() => {
        if (!cartData?.cart) return [];
        return [...new Set(cartData.cart.map(item => item.product.brand))];
    }, [cartData]);

    useFocusEffect(
        useCallback(() => {
            refetchCart();
        }, []),
    );

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (cartCategories.length === 0) return;

            setLoadingRecommendations(true);
            try {
                const response = await axios.get(`${baseUrl}/products?brand=${cartCategories[0]}`);
                if (response.data) {
                    const filtered = response.data?.slice(0, 4) || [];
                    setRecommendations(filtered);
                }
            } catch (error) {
                console.error('Error fetching recommendations:', error);
            } finally {
                setLoadingRecommendations(false);
            }
        };

        fetchRecommendations();
    }, [cartCategories, cartData]);


    const removeFromCart = async (cartItemId) => {
        const result = await deleteRequest(`/api/cart/remove/${cartItemId}`, true);
        if (result) {
            refetchCart(); // Refresh cart data
        }
    };

    const updateQuantity = async (cartItemId, newQuantity) => {
        if (newQuantity <= 0) {
            Alert.alert(
                'Remove Item',
                'Do you want to remove this item from cart?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Remove',
                        style: 'destructive',
                        onPress: () => removeFromCart(cartItemId)
                    }
                ]
            );
            return;
        }

        updateCartQuantity(cartItemId, newQuantity);
    };

    const updateCartQuantity = async (cartItemId, quantity) => {
        const result = await patch(`/api/cart/update/${cartItemId}`, { quantity });
        if (result) {
            refetchCart(); // Refresh cart data
        }
    };

    const addToCart = async (product, variantName = 'Default') => {
        const result = await post('/api/cart/add', {
            productId: product._id,
            quantity: 1,
            variantName: variantName
        }, true);

        if (result) {
            Alert.alert('Success', 'Item added to cart!');
            refetchCart(); // Refresh cart data
        }
    };

    const renderCartItem = (item) => (
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

    const renderRecommendationItem = ({ item }) => (
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
            <TouchableOpacity
                style={styles.addBtn}
                onPress={() => addToCart(item)}
                disabled={postLoading}
            >
                <Text style={styles.addBtnText}>
                    {postLoading ? 'Adding...' : 'Add'}
                </Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    if (cartLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#53B175" />
                <Text>Loading cart...</Text>
            </View>
        );
    }

    if (cartError) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                <Text style={{ color: 'red', textAlign: 'center', marginBottom: 20 }}>
                    Error loading cart: {cartError}
                </Text>
                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={refetchCart}
                >
                    <Text style={styles.addBtnText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!cartData?.cart || cartData.cart.length === 0) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 18, color: '#777' }}>Your cart is empty</Text>
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
            {/* Cart Items */}
            {cartData.cart.map(renderCartItem)}

            {/* Recommendation Section */}
            <Text style={styles.subheading}>Before you Checkout</Text>
            {loadingRecommendations ? (
                <ActivityIndicator size="small" color="#53B175" style={{ margin: 20 }} />
            ) : (
                <FlatList
                    horizontal
                    data={recommendations}
                    keyExtractor={(item) => item._id}
                    renderItem={renderRecommendationItem}
                    showsHorizontalScrollIndicator={false}
                />
            )}

            {/* Coupon Section */}
            <TouchableOpacity style={styles.couponRow}>
                <Text>🧾  APPLY COUPON</Text>
                <Text>{'>'}</Text>
            </TouchableOpacity>

            {/* Summary Section */}
            <View style={styles.summary}>
                <View style={{
                    display: "flex",
                    flexDirection: 'row',
                    justifyContent: "space-between",
                    paddingHorizontal: 10
                }}>
                    <Text style={styles.summaryText}>Items ({cartData.summary.totalQuantity}):</Text>
                    <Text style={styles.summaryText}>Rs{cartData.summary.total.toFixed(2)}</Text>
                </View>

                <View style={{
                    display: "flex",
                    flexDirection: 'row',
                    justifyContent: "space-between",
                    paddingHorizontal: 10
                }}>
                    <Text style={styles.summaryText}>Discount:</Text>
                    <Text style={styles.summaryText}>Rs0.00</Text>
                </View>

                <View style={{
                    display: "flex",
                    flexDirection: 'row',
                    justifyContent: "space-between",
                    paddingHorizontal: 10
                }}>
                    <Text style={styles.summaryText}>Delivery:</Text>
                    <Text style={{ color: 'green' }}>Free</Text>
                </View>
                <Text style={styles.summaryTotal}>
                    Grand Total: Rs{cartData.summary.total.toFixed(2)}
                </Text>
            </View>


            {/* Place Order Button */}
            <TouchableOpacity
                style={[styles.checkoutBtn, (patchLoading || postLoading || deleteLoading) && { opacity: 0.7 }]}
                disabled={patchLoading || postLoading || deleteLoading}
                onPress={() => navigation.navigate("Payment", { total: cartData.summary.total.toFixed(2) })}
            >
                <Text style={styles.checkoutText}>
                    Rs{cartData.summary.total.toFixed(2)}   |   Place Order
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
    cartItem: {
        flexDirection: 'row',
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
    },
    cartImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 15,
    },
    cartTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    cartPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#53B175',
    },
    oldPrice: {
        fontSize: 14,
        textDecorationLine: 'line-through',
        color: '#999',
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
        minWidth: 35,
    },
    qtyText: {
        fontSize: 16,
        paddingHorizontal: 15,
    },
    subheading: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 20,
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
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
    },
    recommendPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#53B175',
        marginRight: 8,
    },
    recommendOldPrice: {
        fontSize: 12,
        textDecorationLine: 'line-through',
        color: '#999',
    },
    addBtn: {
        backgroundColor: '#53B175',
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
    summaryText: {
        fontSize: 16,
        marginBottom: 8,
    },
    summaryTotal: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },


    checkoutBtn: {
        backgroundColor: '#53B175',
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