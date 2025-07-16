import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    Modal,
    Dimensions,
} from 'react-native';
import { Feather, AntDesign, MaterialIcons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedGestureHandler,
    withSpring,
} from 'react-native-reanimated';
import { PinchGestureHandler } from 'react-native-gesture-handler';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ProductScreen = ({ route, navigation }) => {
    const [selectedVariant, setSelectedVariant] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showImageModal, setShowImageModal] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

    const product = route?.params?.product || {
        id: '1',
        name: 'Aashirvaad Shudh Atta',
        description: 'Aashirvaad Atta is made from the finest grains...',
        images: [
            require('../assets/cat1.png'),
            require('../assets/login.png'),
            require('../assets/onboard1.png'),
        ],
        variants: [
            { id: 1, name: '5 kg', price: '$8', mrp: '$10' },
            { id: 2, name: '10 kg', price: '$12', mrp: '$14' },
            { id: 3, name: '20 kg', price: '$20', mrp: '$25' },
        ],
        rating: 4.5,
        reviewCount: 245,
        inStock: true,
    };

    const currentVariant = product.variants[selectedVariant];

    const adjustQuantity = (type) => {
        if (type === 'increase') setQuantity((q) => q + 1);
        if (type === 'decrease' && quantity > 1) setQuantity((q) => q - 1);
    };

    const changeImage = (direction) => {
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

    return (
        <View style={styles.container}>
            {/* Header */}
            {/* <View style={styles.header}>
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
            </View> */}

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Product Image */}
                <View style={styles.imageContainer}>
                    <TouchableOpacity onPress={() => setShowImageModal(true)}>
                        <Image
                            source={product.images[currentImageIndex]}
                            style={styles.productImage}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.imageNavLeft} onPress={() => changeImage('prev')}>
                        <Feather name="chevron-left" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.imageNavRight} onPress={() => changeImage('next')}>
                        <Feather name="chevron-right" size={20} color="#fff" />
                    </TouchableOpacity>

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
                </View>

                {/* Info */}
                <View style={styles.info}>
                    <Text style={styles.name}>{product.name}</Text>

                    <View style={styles.ratingRow}>
                        <View style={styles.ratingContainer}>
                            <AntDesign name="star" size={16} color="#ffc107" />
                            <Text style={styles.rating}>{product.rating}</Text>
                            <Text style={styles.reviewCount}>({product.reviewCount} reviews)</Text>
                        </View>
                        <Text
                            style={[
                                styles.stockStatus,
                                { color: product.inStock ? '#00C851' : '#ff4757' },
                            ]}
                        >
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </Text>
                    </View>

                    <View style={styles.priceRow}>
                        <Text style={styles.mrp}>{currentVariant.mrp}</Text>
                        <Text style={styles.price}>{currentVariant.price}</Text>
                        <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>
                                {Math.round(
                                    ((parseFloat(currentVariant.mrp.slice(1)) -
                                        parseFloat(currentVariant.price.slice(1))) /
                                        parseFloat(currentVariant.mrp.slice(1))) *
                                    100
                                )}
                                % OFF
                            </Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Select Size</Text>
                        <View style={styles.variantContainer}>
                            {product.variants.map((variant, index) => (
                                <TouchableOpacity
                                    key={variant.id}
                                    style={[
                                        styles.variantButton,
                                        selectedVariant === index && styles.selectedVariant,
                                    ]}
                                    onPress={() => setSelectedVariant(index)}
                                >
                                    <Text
                                        style={[
                                            styles.variantText,
                                            selectedVariant === index && styles.selectedVariantText,
                                        ]}
                                    >
                                        {variant.name}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.variantPrice,
                                            selectedVariant === index && styles.selectedVariantText,
                                        ]}
                                    >
                                        {variant.price}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

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
                                style={styles.quantityButton}
                                onPress={() => adjustQuantity('increase')}
                            >
                                <MaterialIcons name="add" size={20} color="#333" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.desc}>{product.description}</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <View style={styles.totalPrice}>
                    <Text style={styles.totalLabel}>Total: </Text>
                    <Text style={styles.totalAmount}>
                        {(parseFloat(currentVariant.price.slice(1)) * quantity).toFixed(2)}
                    </Text>
                </View>
                <TouchableOpacity
                    style={[styles.cartBtn, !product.inStock && styles.disabledCartBtn]}
                    disabled={!product.inStock}
                >
                    <Text style={styles.cartBtnText}>
                        {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </Text>
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
                                source={product.images[currentImageIndex]}
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
    info: { backgroundColor: '#fff', padding: 20, marginBottom: 8 },
    name: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 8 },
    ratingRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    ratingContainer: { flexDirection: 'row', alignItems: 'center' },
    rating: { fontSize: 16, fontWeight: '600', marginLeft: 4, color: '#333' },
    reviewCount: { fontSize: 14, color: '#666', marginLeft: 4 },
    stockStatus: { fontSize: 14, fontWeight: '600' },
    priceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
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
    variantText: { fontSize: 14, fontWeight: '600', color: '#333' },
    selectedVariantText: { color: '#fff' },
    variantPrice: { fontSize: 12, color: '#666', marginTop: 2 },
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
export default ProductScreen