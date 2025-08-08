import React from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing
} from 'react-native-reanimated';
import appColors from '../colors/appColors';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = 100;
const PRODUCT_WIDTH = (width - SIDEBAR_WIDTH - 40) / 2 - 10;

const SkeletonBox = React.memo(({ width, height, style }) => {
    const shimmerValue = useSharedValue(0);

    React.useEffect(() => {
        shimmerValue.value = withRepeat(
            withTiming(1, {
                duration: 1000,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            }),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: shimmerValue.value * 0.4 + 0.3,
    }));

    return (
        <Animated.View
            style={[
                {
                    width,
                    height,
                    backgroundColor: '#E1E9EE',
                    borderRadius: 8,
                },
                animatedStyle,
                style,
            ]}
        />
    );
});

const SidebarItemSkeleton = () => (
    <View style={styles.sidebarItem}>
        <SkeletonBox width={80} height={12} />
    </View>
);

const ProductCardSkeleton = () => (
    <View style={styles.productCard}>
        <SkeletonBox
            width={PRODUCT_WIDTH - 16}
            height={100}
            style={styles.productImage}
        />
        <SkeletonBox
            width={PRODUCT_WIDTH - 40}
            height={14}
            style={styles.productTitle}
        />
        <SkeletonBox
            width={60}
            height={12}
            style={styles.productBrand}
        />
        <View style={styles.productPriceRow}>
            <SkeletonBox width={50} height={12} />
            <SkeletonBox width={40} height={12} />
        </View>
    </View>
);

export const CategoryProductsSkeleton = React.memo(() => {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {/* Sidebar Skeleton */}
                <View style={styles.sidebar}>
                    {[1, 2, 3, 4, 5, 6].map((_, index) => (
                        <SidebarItemSkeleton key={index} />
                    ))}
                </View>

                {/* Products Grid Skeleton */}
                <View style={styles.productsContainer}>
                    <View style={styles.productsGrid}>
                        {[1, 2, 3, 4, 5, 6].map((_, index) => (
                            <ProductCardSkeleton key={index} />
                        ))}
                    </View>
                </View>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        flexDirection: 'row',
    },
    sidebar: {
        width: SIDEBAR_WIDTH,
        borderRightWidth: 1,
        borderRightColor: '#eee',
        paddingVertical: 10,
    },
    sidebarItem: {
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderLeftWidth: 3,
        borderLeftColor: 'transparent',
    },
    productsContainer: {
        flex: 1,
        padding: 10,
    },
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    productCard: {
        width: PRODUCT_WIDTH,
        backgroundColor: '#fff',
        marginBottom: 15,
        borderRadius: 12,
        padding: 8,
        elevation: 1,
    },
    productImage: {
        marginBottom: 12,
        borderRadius: 8,
    },
    productTitle: {
        marginBottom: 8,
    },
    productBrand: {
        marginBottom: 8,
    },
    productPriceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
});