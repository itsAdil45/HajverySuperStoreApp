import React, { useMemo } from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    FlatList,
    ScrollView
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    interpolate,
    Easing
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// Shared shimmer animation instance
let sharedShimmerValue = null;
const getSharedShimmerValue = () => {
    if (!sharedShimmerValue) {
        sharedShimmerValue = useSharedValue(0);
        sharedShimmerValue.value = withRepeat(
            withTiming(1, {
                duration: 1200,
                easing: Easing.out(Easing.quad),
            }),
            -1,
            false
        );
    }
    return sharedShimmerValue;
};

// Base Skeleton Box Component
const SkeletonBox = React.memo(({
    width: boxWidth,
    height,
    borderRadius = 8,
    style = {},
    disableShimmer = false
}) => {
    const shimmerAnimation = disableShimmer ? null : getSharedShimmerValue();

    const animatedShimmerStyle = useAnimatedStyle(() => {
        if (!shimmerAnimation) return {};

        const translateX = interpolate(
            shimmerAnimation.value,
            [0, 1],
            [-boxWidth * 0.5, boxWidth * 1.5]
        );

        return {
            transform: [{ translateX }],
        };
    }, [boxWidth, shimmerAnimation]);

    const boxStyle = useMemo(() => [
        styles.skeletonBox,
        {
            width: boxWidth,
            height,
            borderRadius
        },
        style
    ], [boxWidth, height, borderRadius, style]);

    const shimmerStyle = useMemo(() => [
        styles.shimmerOverlay,
        {
            width: boxWidth * 0.8,
            height,
            borderRadius
        }
    ], [boxWidth, height, borderRadius]);

    return (
        <View style={boxStyle}>
            {!disableShimmer && (
                <Animated.View
                    style={[shimmerStyle, animatedShimmerStyle]}
                />
            )}
        </View>
    );
});

// Cart Item Skeleton - Regular Product
const CartItemSkeleton = React.memo(() => (
    <View style={styles.cartItemSkeleton}>
        {/* Product Image */}
        <SkeletonBox
            width={100}
            height={100}
            borderRadius={8}
            style={styles.cartImageSkeleton}
            disableShimmer
        />

        {/* Product Info */}
        <View style={styles.cartInfoSkeleton}>
            {/* Product Title */}
            <SkeletonBox width={180} height={16} borderRadius={4} />

            {/* Variant */}
            <View style={styles.cartVariantSkeleton}>
                <SkeletonBox width={120} height={12} borderRadius={4} />
            </View>

            {/* Brand */}
            <View style={styles.cartBrandSkeleton}>
                <SkeletonBox width={100} height={12} borderRadius={4} />
            </View>

            {/* Price and Quantity Row */}
            <View style={styles.cartPriceRowSkeleton}>
                <View>
                    <SkeletonBox width={80} height={16} borderRadius={4} />
                    <View style={styles.cartOldPriceSkeleton}>
                        <SkeletonBox width={60} height={12} borderRadius={4} />
                    </View>
                </View>

                {/* Quantity Controls */}
                <View style={styles.qtyRowSkeleton}>
                    <SkeletonBox width={35} height={30} borderRadius={4} />
                    <View style={styles.qtyTextSkeleton}>
                        <SkeletonBox width={20} height={16} borderRadius={4} />
                    </View>
                    <SkeletonBox width={35} height={30} borderRadius={4} />
                </View>
            </View>
        </View>
    </View>
));

// Deal Item Skeleton
const DealItemSkeleton = React.memo(() => (
    <View style={styles.cartItemSkeleton}>
        {/* Deal Banner Image */}
        <SkeletonBox
            width={100}
            height={100}
            borderRadius={8}
            style={styles.cartImageSkeleton}
            disableShimmer
        />

        {/* Deal Info */}
        <View style={styles.cartInfoSkeleton}>
            {/* Deal Badge */}
            <View style={styles.dealBadgeSkeleton}>
                <SkeletonBox width={40} height={16} borderRadius={8} />
            </View>

            {/* Deal Title */}
            <SkeletonBox width={200} height={16} borderRadius={4} />

            {/* Deal Description */}
            <View style={styles.dealDescSkeleton}>
                <SkeletonBox width={220} height={12} borderRadius={4} />
                <View style={styles.dealDescLine2}>
                    <SkeletonBox width={150} height={12} borderRadius={4} />
                </View>
            </View>

            {/* Deal Products */}
            <View style={styles.dealProductsSkeleton}>
                <SkeletonBox width={60} height={12} borderRadius={4} />

                {/* Product Items */}
                {[...Array(3)].map((_, index) => (
                    <View key={index} style={styles.dealProductSkeleton}>
                        <SkeletonBox width={20} height={20} borderRadius={4} />
                        <View style={styles.dealProductInfoSkeleton}>
                            <SkeletonBox width={80} height={11} borderRadius={3} />
                            <SkeletonBox width={60} height={10} borderRadius={3} />
                        </View>
                    </View>
                ))}
            </View>

            {/* Deal Pricing */}
            <View style={styles.dealPricingSkeleton}>
                <View>
                    <View style={styles.priceRowSkeleton}>
                        <SkeletonBox width={80} height={16} borderRadius={4} />
                        <SkeletonBox width={60} height={12} borderRadius={4} />
                    </View>
                    <View style={styles.savingsSkeleton}>
                        <SkeletonBox width={120} height={12} borderRadius={4} />
                    </View>
                </View>
            </View>
        </View>
    </View>
));

// Recommendation Card Skeleton
const RecommendationCardSkeleton = React.memo(() => (
    <View style={styles.recommendCardSkeleton}>
        <SkeletonBox
            width={130}
            height={80}
            borderRadius={8}
            style={styles.recommendImageSkeleton}
            disableShimmer
        />

        <View style={styles.recommendTitleSkeleton}>
            <SkeletonBox width={120} height={14} borderRadius={4} />
            <View style={styles.recommendTitleLine2}>
                <SkeletonBox width={80} height={14} borderRadius={4} />
            </View>
        </View>

        <View style={styles.recommendBrandSkeleton}>
            <SkeletonBox width={60} height={12} borderRadius={4} />
        </View>

        <View style={styles.recommendPriceRowSkeleton}>
            <SkeletonBox width={60} height={14} borderRadius={4} />
            <SkeletonBox width={40} height={12} borderRadius={4} />
        </View>

        <SkeletonBox
            width={130}
            height={35}
            borderRadius={5}
            style={styles.recommendButtonSkeleton}
            disableShimmer
        />
    </View>
));

// Recommendations Section Skeleton
const RecommendationsSkeleton = React.memo(() => {
    const recommendationsData = useMemo(() => Array(4).fill(0).map((_, i) => ({ key: i })), []);

    return (
        <View>
            {/* Section Title */}
            <SkeletonBox width={180} height={18} borderRadius={4} style={styles.subheadingSkeleton} />

            {/* Recommendations List */}
            <FlatList
                data={recommendationsData}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={() => <RecommendationCardSkeleton />}
                keyExtractor={(item) => item.key.toString()}
                initialNumToRender={3}
                maxToRenderPerBatch={2}
                windowSize={4}
            />
        </View>
    );
});

// Coupon Section Skeleton
const CouponSkeleton = React.memo(() => (
    <View style={styles.couponSkeleton}>
        <SkeletonBox width={140} height={16} borderRadius={4} />
        <SkeletonBox width={20} height={16} borderRadius={4} />
    </View>
));

// Summary Section Skeleton
const SummarySkeleton = React.memo(() => (
    <View style={styles.summarySkeleton}>
        {/* Items Row */}
        <View style={styles.summaryRowSkeleton}>
            <SkeletonBox width={100} height={16} borderRadius={4} />
            <SkeletonBox width={80} height={16} borderRadius={4} />
        </View>

        {/* Breakdown */}
        <View style={styles.breakdownSkeleton}>
            <View style={styles.summaryRowSkeleton}>
                <SkeletonBox width={80} height={14} borderRadius={4} />
            </View>
            <View style={styles.summaryRowSkeleton}>
                <SkeletonBox width={70} height={14} borderRadius={4} />
            </View>
        </View>

        {/* Discount Row */}
        <View style={styles.summaryRowSkeleton}>
            <SkeletonBox width={80} height={16} borderRadius={4} />
            <SkeletonBox width={60} height={16} borderRadius={4} />
        </View>

        {/* Delivery Row */}
        <View style={styles.summaryRowSkeleton}>
            <SkeletonBox width={80} height={16} borderRadius={4} />
            <SkeletonBox width={50} height={16} borderRadius={4} />
        </View>

        {/* Total */}
        <View style={styles.summaryTotalSkeleton}>
            <SkeletonBox width={180} height={18} borderRadius={4} />
        </View>
    </View>
));

// Checkout Button Skeleton
const CheckoutButtonSkeleton = React.memo(() => (
    <SkeletonBox
        width={width - 40}
        height={50}
        borderRadius={10}
        style={styles.checkoutButtonSkeleton}
        disableShimmer
    />
));

// Main Cart Page Skeleton
export const CartPageSkeleton = React.memo(({ itemCount = 3 }) => {
    const cartItems = useMemo(() =>
        Array(itemCount).fill(0).map((_, i) => ({
            key: i,
            type: i % 3 === 0 ? 'deal' : 'product'
        })),
        [itemCount]
    );

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
        >
            {/* Cart Items */}
            {cartItems.map((item) => (
                item.type === 'deal'
                    ? <DealItemSkeleton key={item.key} />
                    : <CartItemSkeleton key={item.key} />
            ))}

            {/* Recommendations Section */}
            <RecommendationsSkeleton />

            {/* Coupon Section */}
            <CouponSkeleton />

            {/* Summary Section */}
            <SummarySkeleton />

            {/* Checkout Button */}
            <CheckoutButtonSkeleton />

            <View style={styles.bottomSpacing} />
        </ScrollView>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    skeletonBox: {
        backgroundColor: '#F0F0F0',
        overflow: 'hidden',
    },
    shimmerOverlay: {
        position: 'absolute',
        top: 0,
        left: -20,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
    },
    // Cart Item Skeleton Styles
    cartItemSkeleton: {
        flexDirection: 'row',
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
    },
    cartImageSkeleton: {
        marginRight: 15,
    },
    cartInfoSkeleton: {
        flex: 1,
    },
    cartVariantSkeleton: {
        marginTop: 5,
    },
    cartBrandSkeleton: {
        marginTop: 3,
    },
    cartPriceRowSkeleton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    cartOldPriceSkeleton: {
        marginTop: 4,
    },
    qtyRowSkeleton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    qtyTextSkeleton: {
        paddingHorizontal: 15,
    },
    // Deal Item Skeleton Styles
    dealBadgeSkeleton: {
        marginBottom: 5,
    },
    dealDescSkeleton: {
        marginTop: 5,
        marginBottom: 8,
    },
    dealDescLine2: {
        marginTop: 3,
    },
    dealProductsSkeleton: {
        marginBottom: 10,
    },
    dealProductSkeleton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    dealProductInfoSkeleton: {
        marginLeft: 8,
        flex: 1,
    },
    dealPricingSkeleton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceRowSkeleton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    savingsSkeleton: {
        marginTop: 2,
    },
    // Recommendations Skeleton Styles
    subheadingSkeleton: {
        marginVertical: 20,
    },
    recommendCardSkeleton: {
        width: 150,
        backgroundColor: '#f8f8f8',
        padding: 10,
        borderRadius: 10,
        marginRight: 15,
    },
    recommendImageSkeleton: {
        marginBottom: 8,
    },
    recommendTitleSkeleton: {
        marginBottom: 5,
    },
    recommendTitleLine2: {
        marginTop: 3,
    },
    recommendBrandSkeleton: {
        marginBottom: 5,
    },
    recommendPriceRowSkeleton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    recommendButtonSkeleton: {
        marginTop: 5,
    },
    // Coupon Skeleton Styles
    couponSkeleton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 10,
        marginVertical: 20,
    },
    // Summary Skeleton Styles
    summarySkeleton: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    summaryRowSkeleton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        marginBottom: 8,
    },
    breakdownSkeleton: {
        paddingLeft: 10,
        marginBottom: 5,
    },
    summaryTotalSkeleton: {
        alignItems: 'center',
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    // Checkout Button Skeleton Styles
    checkoutButtonSkeleton: {
        marginTop: 20,
        marginBottom: 40,
    },
    bottomSpacing: {
        height: 20,
    },
});