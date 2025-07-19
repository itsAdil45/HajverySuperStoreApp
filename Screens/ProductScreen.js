import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    Modal,
    Dimensions,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Feather, AntDesign, MaterialIcons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedGestureHandler,
    withSpring,
} from 'react-native-reanimated';
import { PinchGestureHandler } from 'react-native-gesture-handler';
import useGet from '../hooks/useGet';
import usePost from '../hooks/usePost';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ProductScreen = ({ route, navigation }) => {
    const { productId } = route.params || {};

    // Fetch product data from API
    const { data: product, loading, error, refetch } = useGet(`/products/${productId}`);

    // Cart functionality
    const { post: addToCart, loading: addingToCart, error: cartError, errorCode } = usePost();

    const [selectedVariant, setSelectedVariant] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showImageModal, setShowImageModal] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

    // Reset selected variant when product changes
    useEffect(() => {
        if (product && product.variants && product.variants.length > 0) {
            setSelectedVariant(0);
        }
    }, [product]);

    // Show error alert when cart error occurs
    useEffect(() => {
        if (cartError) {
            Alert.alert(
                'Error Adding to Cart',
                cartError,
                [{ text: 'OK', style: 'default' }]
            );
        }
    }, [cartError]);

    // Helper functions
    const getCurrentVariant = () => {
        if (product && product.variants && product.variants.length > 0) {
            return product.variants[selectedVariant];
        }
        return null;
    };

    const getCurrentVariantName = () => {
        const variant = getCurrentVariant();
        return variant ? variant.name : 'Default';
    };

    const getPrice = () => {
        const variant = getCurrentVariant();
        if (variant) {
            return variant.isOnSale ? variant.salePrice || variant.price : variant.price;
        }
        return product?.startingPrice || product?.bestPrice || 0;
    };

    const getMRP = () => {
        const variant = getCurrentVariant();
        if (variant) {
            return variant.price;
        }
        return product?.startingPrice || product?.bestPrice || 0;
    };

    const getDiscountPercentage = () => {
        const variant = getCurrentVariant();
        if (variant && variant.isOnSale && variant.salePrice) {
            return Math.round(((variant.price - variant.salePrice) / variant.price) * 100);
        }
        return 0;
    };

    const isOnSale = () => {
        const variant = getCurrentVariant();
        if (variant) {
            return variant.isOnSale;
        }
        return product?.hasActiveSale || false;
    };

    const getStock = () => {
        // const variant = getCurrentVariant();
        // if (variant) {
        //     return variant.stock;
        // }
        return product?.stock || 0;
    };

    const isInStock = () => {
        return getStock() > 0;
    };

    const adjustQuantity = (type) => {
        const maxStock = getStock();
        if (type === 'increase' && quantity < maxStock) {
            setQuantity((q) => q + 1);
        }
        if (type === 'decrease' && quantity > 1) {
            setQuantity((q) => q - 1);
        }
    };

    const changeImage = (direction) => {
        if (!product || !product.images) return;

        if (direction === 'next') {
            setCurrentImageIndex((prev) =>
                prev === product.images.length - 1 ? 0 : prev + 1
            );
        } else {
            setCurrentImageIndex((prev) =>
                prev === 0 ? product.images.length - 1 : prev - 1
            );
        }
    };

    const formatPrice = (price) => {
        return `Rs ${parseFloat(price).toFixed(2)}`;
    };

    // Add to cart function
    const handleAddToCart = async () => {
        if (!isInStock()) {
            Alert.alert('Out of Stock', 'This product is currently out of stock.');
            return;
        }

        const cartData = {
            productId: product._id || product.id || productId,
            quantity: quantity,
            variantName: getCurrentVariantName()
        };

        console.log('Adding to cart:', cartData);

        try {
            const response = await addToCart('/api/cart/add', cartData, true); // useAuth = true for authenticated request

            if (response) {
                Alert.alert(
                    'Success!',
                    `${quantity} ${quantity === 1 ? 'item' : 'items'} added to cart`,
                    [
                        {
                            text: 'Continue Shopping',
                            style: 'default'
                        },
                        {
                            text: 'View Cart',
                            style: 'default',
                            onPress: () => {
                                // Navigate to cart screen if available
                                // navigation.navigate('Cart');
                                console.log('Navigate to cart screen');
                            }
                        }
                    ]
                );
            }
        } catch (err) {
            console.error('Error adding to cart:', err);
            Alert.alert(
                'Error',
                'Failed to add item to cart. Please try again.',
                [{ text: 'OK', style: 'default' }]
            );
        }
    };

    // Reanimated pinch-to-zoom
    const scale = useSharedValue(1);

    const pinchHandler = useAnimatedGestureHandler({
        onActive: (event) => {
            scale.value = event.scale;
        },
        onEnd: () => {
            scale.value = withSpring(1);
        },
    });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    // Loading state
    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Feather name="chevron-left" size={24} color="#333" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Loading...</Text>
                    </View>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#00C851" />
                    <Text style={styles.loadingText}>Loading product details...</Text>
                </View>
            </View>
        );
    }

    // Error state
    if (error) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Feather name="chevron-left" size={24} color="#333" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Error</Text>
                    </View>
                </View>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Failed to load product details</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // No product data
    if (!product) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Feather name="chevron-left" size={24} color="#333" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Product Not Found</Text>
                    </View>
                </View>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Product not found</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Feather name="chevron-left" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Product Details</Text>
                </View>
                <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)}>
                    <AntDesign
                        name={isFavorite ? 'heart' : 'hearto'}
                        size={20}
                        color={isFavorite ? '#ff4757' : '#333'}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Product Image */}
                <View style={styles.imageContainer}>
                    <TouchableOpacity onPress={() => setShowImageModal(true)}>
                        <Image
                            source={{ uri: product.images[currentImageIndex] }}
                            style={styles.productImage}
                        />
                    </TouchableOpacity>

                    {product.images.length > 1 && (
                        <>
                            <TouchableOpacity style={styles.imageNavLeft} onPress={() => changeImage('prev')}>
                                <Feather name="chevron-left" size={20} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.imageNavRight} onPress={() => changeImage('next')}>
                                <Feather name="chevron-right" size={20} color="#fff" />
                            </TouchableOpacity>
                        </>
                    )}

                    {product.images.length > 1 && (
                        <View style={styles.indicators}>
                            {product.images.map((_, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.indicator,
                                        currentImageIndex === index && styles.activeIndicator,
                                    ]}
                                />
                            ))}
                        </View>
                    )}

                    {isOnSale() && (
                        <View style={styles.saleTag}>
                            <Text style={styles.saleText}>SALE</Text>
                        </View>
                    )}
                </View>

                {/* Info */}
                <View style={styles.info}>
                    <Text style={styles.name}>{product.name}</Text>
                    <Text style={styles.brand}>Brand: {product.brand}</Text>

                    <View style={styles.ratingRow}>
                        <View style={styles.ratingContainer}>
                            <Text style={styles.category}>
                                Category: {typeof product.category === 'object' ? product.category.sub : product.category}
                            </Text>
                        </View>
                        <Text
                            style={[
                                styles.stockStatus,
                                { color: isInStock() ? '#00C851' : '#ff4757' },
                            ]}
                        >
                            {isInStock() ? `In Stock (${getStock()})` : 'Out of Stock'}
                        </Text>
                    </View>

                    <View style={styles.priceRow}>
                        {isOnSale() && getPrice() < getMRP() && (
                            <Text style={styles.mrp}>{formatPrice(getMRP())}</Text>
                        )}
                        <Text style={styles.price}>{formatPrice(getPrice())}</Text>
                        {isOnSale() && getDiscountPercentage() > 0 && (
                            <View style={styles.discountBadge}>
                                <Text style={styles.discountText}>
                                    {getDiscountPercentage()}% OFF
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Price Range Display */}
                    {product.priceRange && product.variants && product.variants.length > 1 && (
                        <Text style={styles.priceRange}>Price Range: {product.priceRange}</Text>
                    )}

                    {product.variants && product.variants.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Select Variant</Text>
                            <View style={styles.variantContainer}>
                                {product.variants.map((variant, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.variantButton,
                                            selectedVariant === index && styles.selectedVariant,
                                            getStock() === 0 && styles.outOfStockVariant,
                                        ]}
                                        onPress={() => {
                                            if (getStock() > 0) {
                                                setSelectedVariant(index);
                                                setQuantity(1); // Reset quantity when variant changes
                                            }
                                        }}
                                        disabled={getStock() === 0}
                                    >
                                        <Text
                                            style={[
                                                styles.variantText,
                                                selectedVariant === index && styles.selectedVariantText,
                                                getStock() === 0 && styles.outOfStockText,
                                            ]}
                                        >
                                            {variant.name}
                                        </Text>
                                        <Text
                                            style={[
                                                styles.variantPrice,
                                                selectedVariant === index && styles.selectedVariantText,
                                                getStock() === 0 && styles.outOfStockText,
                                            ]}
                                        >
                                            {formatPrice(variant.price)}
                                        </Text>
                                        {getStock() === 0 ? (
                                            <Text style={styles.outOfStockLabel}>Out of Stock</Text>
                                        ) : getStock() <= 5 && (
                                            <Text
                                                style={[
                                                    styles.variantStock,
                                                    selectedVariant === index && styles.selectedVariantText,
                                                ]}
                                            >
                                                Only {getStock()} left
                                            </Text>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {isInStock() && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Quantity</Text>
                            <View style={styles.quantityContainer}>
                                <TouchableOpacity
                                    style={[styles.quantityButton, quantity === 1 && styles.disabledButton]}
                                    onPress={() => adjustQuantity('decrease')}
                                    disabled={quantity === 1}
                                >
                                    <MaterialIcons
                                        name="remove"
                                        size={20}
                                        color={quantity === 1 ? '#ccc' : '#333'}
                                    />
                                </TouchableOpacity>
                                <Text style={styles.quantityText}>{quantity}</Text>
                                <TouchableOpacity
                                    style={[styles.quantityButton, quantity >= getStock() && styles.disabledButton]}
                                    onPress={() => adjustQuantity('increase')}
                                    disabled={quantity >= getStock()}
                                >
                                    <MaterialIcons
                                        name="add"
                                        size={20}
                                        color={quantity >= getStock() ? '#ccc' : '#333'}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.desc}>{product.description}</Text>
                    </View>

                    {/* Additional Product Info */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Product Information</Text>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Product ID:</Text>
                            <Text style={styles.infoValue}>{product.id || product._id}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Total Stock:</Text>
                            <Text style={styles.infoValue}>{product.stock}</Text>
                        </View>
                        {product.createdAt && (
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Added:</Text>
                                <Text style={styles.infoValue}>
                                    {new Date(product.createdAt).toLocaleDateString()}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <View style={styles.totalPrice}>
                    <Text style={styles.totalLabel}>Total: </Text>
                    <Text style={styles.totalAmount}>
                        {formatPrice(getPrice() * quantity)}
                    </Text>
                </View>
                <TouchableOpacity
                    style={[
                        styles.cartBtn,
                        (!isInStock() || addingToCart) && styles.disabledCartBtn
                    ]}
                    disabled={!isInStock() || addingToCart}
                    onPress={handleAddToCart}
                >
                    {addingToCart ? (
                        <View style={styles.loadingButtonContent}>
                            <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.cartBtnText}>Adding...</Text>
                        </View>
                    ) : (
                        <Text style={styles.cartBtnText}>
                            {isInStock() ? 'Add to Cart' : 'Out of Stock'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Modal with zoom */}
            <Modal
                visible={showImageModal}
                transparent
                animationType="fade"
                onRequestClose={() => {
                    setShowImageModal(false);
                    scale.value = 1;
                }}
            >
                <View style={styles.modalContainer}>
                    <TouchableOpacity
                        style={styles.modalCloseButton}
                        onPress={() => {
                            setShowImageModal(false);
                            scale.value = 1;
                        }}
                    >
                        <Feather name="x" size={24} color="#fff" />
                    </TouchableOpacity>

                    <PinchGestureHandler onGestureEvent={pinchHandler}>
                        <Animated.View style={[styles.modalImageContainer, animatedStyle]}>
                            <Image
                                source={{ uri: product.images[currentImageIndex] }}
                                style={styles.modalImage}
                                resizeMode="contain"
                            />
                        </Animated.View>
                    </PinchGestureHandler>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    header: {
        padding: 16,
        paddingTop: 50,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 12, color: '#333' },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    retryBtn: {
        backgroundColor: '#00C851',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    content: { paddingBottom: 120 },
    imageContainer: { position: 'relative', backgroundColor: '#fff' },
    productImage: { width: '100%', height: 300, resizeMode: 'contain' },
    imageNavLeft: {
        position: 'absolute',
        top: '50%',
        left: 16,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 10,
        borderRadius: 20,
    },
    imageNavRight: {
        position: 'absolute',
        top: '50%',
        right: 16,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 10,
        borderRadius: 20,
    },
    indicators: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 12,
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ddd',
        marginHorizontal: 4,
    },
    activeIndicator: { backgroundColor: '#00C851' },
    saleTag: {
        position: 'absolute',
        top: 16,
        left: 16,
        backgroundColor: '#ff4757',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
    },
    saleText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    info: { backgroundColor: '#fff', padding: 20, marginBottom: 8 },
    name: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 4 },
    brand: { fontSize: 16, color: '#666', marginBottom: 8 },
    ratingRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    ratingContainer: { flex: 1 },
    category: { fontSize: 14, color: '#666' },
    stockStatus: { fontSize: 14, fontWeight: '600' },
    priceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    priceRange: { fontSize: 14, color: '#666', marginBottom: 12, fontStyle: 'italic' },
    mrp: { color: '#999', textDecorationLine: 'line-through', fontSize: 16, marginRight: 12 },
    price: { fontSize: 24, fontWeight: 'bold', color: '#00C851', marginRight: 12 },
    discountBadge: {
        backgroundColor: '#ff4757',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    discountText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, color: '#333' },
    variantContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    variantButton: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        minWidth: 80,
        alignItems: 'center',
    },
    selectedVariant: { borderColor: '#00C851', backgroundColor: '#00C851' },
    outOfStockVariant: { borderColor: '#ccc', backgroundColor: '#f8f8f8' },
    variantText: { fontSize: 14, fontWeight: '600', color: '#333' },
    selectedVariantText: { color: '#fff' },
    outOfStockText: { color: '#999' },
    variantPrice: { fontSize: 12, color: '#666', marginTop: 2 },
    variantStock: { fontSize: 10, color: '#ff4757', marginTop: 2 },
    outOfStockLabel: { fontSize: 10, color: '#ff4757', marginTop: 2, fontWeight: 'bold' },
    quantityContainer: { flexDirection: 'row', alignItems: 'center' },
    quantityButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabledButton: { backgroundColor: '#f8f8f8' },
    quantityText: { fontSize: 18, fontWeight: '600', marginHorizontal: 20, color: '#333' },
    desc: { fontSize: 16, lineHeight: 24, color: '#666' },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    infoLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '400',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        padding: 20,
    },
    totalPrice: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    totalLabel: { fontSize: 16, color: '#666' },
    totalAmount: { fontSize: 20, fontWeight: 'bold', color: '#00C851' },
    cartBtn: {
        backgroundColor: '#00C851',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    disabledCartBtn: { backgroundColor: '#ccc' },
    cartBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    loadingButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCloseButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 1,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalImageContainer: {
        width: screenWidth,
        height: screenHeight * 0.8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalImage: {
        width: '100%',
        height: '100%',
    },
});

export default ProductScreen;