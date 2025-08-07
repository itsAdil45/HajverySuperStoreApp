import React, { useEffect, useMemo } from 'react';
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
                duration: 1000, // Reduced from 1500ms
                easing: Easing.out(Easing.quad),
            }),
            -1,
            false
        );
    }
    return sharedShimmerValue;
};

// Optimized Base Skeleton Box Component
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

// Optimized Header Skeleton
export const HeaderSkeleton = React.memo(() => (
    <View style={styles.headerSkeleton}>
        <View>
            <SkeletonBox width={120} height={20} borderRadius={4} />
            <View style={styles.headerSubtitle}>
                <SkeletonBox width={90} height={14} borderRadius={4} />
            </View>
        </View>
        <SkeletonBox width={40} height={40} borderRadius={20} />
    </View>
));

// Optimized Search Bar Skeleton
export const SearchBarSkeleton = React.memo(() => (
    <View style={styles.searchSkeleton}>
        <SkeletonBox
            width={width - 80}
            height={48}
            borderRadius={15}
            style={styles.searchInput}
        />
        <SkeletonBox width={48} height={48} borderRadius={15} />
    </View>
));

// Optimized Category Item
const CategoryItem = React.memo(({ index }) => (
    <View style={styles.categoryItemSkeleton} key={index}>
        <SkeletonBox width={70} height={70} borderRadius={20} />
        <View style={styles.categoryLabel}>
            <SkeletonBox width={60} height={12} borderRadius={4} />
        </View>
    </View>
));

// Optimized Categories Skeleton
export const CategoriesSkeleton = React.memo(() => {
    const categoryData = useMemo(() => Array(6).fill(0).map((_, i) => ({ key: i })), []);

    return (
        <View>
            <View style={styles.sectionHeaderSkeleton}>
                <SkeletonBox width={150} height={20} borderRadius={4} />
                <SkeletonBox width={60} height={16} borderRadius={4} />
            </View>

            <FlatList
                data={categoryData}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryRowSkeleton}
                renderItem={({ item }) => <CategoryItem index={item.key} />}
                keyExtractor={(item) => item.key.toString()}
                initialNumToRender={4}
                maxToRenderPerBatch={2}
                windowSize={5}
            />
        </View>
    );
});

// Optimized Banner Skeleton
export const BannerSkeleton = React.memo(() => (
    <View style={styles.bannerSkeleton}>
        <View style={styles.bannerContent}>
            <SkeletonBox width={200} height={18} borderRadius={4} />
            <View style={styles.bannerSubtitle}>
                <SkeletonBox width={150} height={14} borderRadius={4} />
            </View>
            <View style={styles.bannerButton}>
                <SkeletonBox width={100} height={35} borderRadius={15} />
            </View>
        </View>
        <SkeletonBox width={110} height={110} borderRadius={10} />
    </View>
));

// Optimized Deal Card Skeleton
const DealCardSkeleton = React.memo(() => (
    <View style={styles.dealCardSkeleton}>
        <SkeletonBox width={280} height={120} borderRadius={0} disableShimmer />

        <View style={styles.dealContentSkeleton}>
            <SkeletonBox width={200} height={16} borderRadius={4} />

            <View style={styles.dealPriceRowSkeleton}>
                <SkeletonBox width={80} height={20} borderRadius={4} />
                <SkeletonBox width={60} height={14} borderRadius={4} />
            </View>

            <View style={styles.dealMetaSkeleton}>
                <SkeletonBox width={80} height={20} borderRadius={12} />
                <SkeletonBox width={60} height={16} borderRadius={4} />
            </View>

            <SkeletonBox width={260} height={40} borderRadius={12} disableShimmer />
        </View>
    </View>
));

// Optimized Deals Section Skeleton
export const DealsSkeleton = React.memo(() => {
    const dealsData = useMemo(() => Array(3).fill(0).map((_, i) => ({ key: i })), []);

    return (
        <View>
            <View style={styles.sectionHeaderSkeleton}>
                <View style={styles.sectionHeaderLeft}>
                    <SkeletonBox width={22} height={22} borderRadius={11} />
                    <View style={styles.sectionTitle}>
                        <SkeletonBox width={100} height={20} borderRadius={4} />
                    </View>
                </View>
                <SkeletonBox width={60} height={16} borderRadius={4} />
            </View>

            <FlatList
                data={dealsData}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.dealsContainerSkeleton}
                renderItem={() => <DealCardSkeleton />}
                keyExtractor={(item) => item.key.toString()}
                initialNumToRender={2}
                maxToRenderPerBatch={1}
                windowSize={3}
            />
        </View>
    );
});

// Optimized Product Card Skeleton
const ProductCardSkeleton = React.memo(() => (
    <View style={styles.productCardSkeleton}>
        <SkeletonBox width={136} height={100} borderRadius={10} disableShimmer />

        <View style={styles.productTitle}>
            <SkeletonBox width={120} height={14} borderRadius={4} />
        </View>

        <View style={styles.productSubtitle}>
            <SkeletonBox width={80} height={12} borderRadius={4} />
        </View>

        <View style={styles.productPrice}>
            <SkeletonBox width={100} height={14} borderRadius={4} />
        </View>

        <View style={styles.productButton}>
            <SkeletonBox width={136} height={30} borderRadius={8} disableShimmer />
        </View>
    </View>
));

// Optimized Products Section Skeleton
export const ProductsSkeleton = React.memo(({ title = "Products" }) => {
    const productsData = useMemo(() => Array(4).fill(0).map((_, i) => ({ key: i })), []);

    return (
        <View>
            <View style={styles.sectionHeaderSkeleton}>
                <View style={styles.sectionHeaderLeft}>
                    <SkeletonBox width={22} height={22} borderRadius={11} />
                    <View style={styles.sectionTitle}>
                        <SkeletonBox width={120} height={20} borderRadius={4} />
                    </View>
                </View>
                <SkeletonBox width={60} height={16} borderRadius={4} />
            </View>

            <FlatList
                data={productsData}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.productsContainerSkeleton}
                renderItem={() => <ProductCardSkeleton />}
                keyExtractor={(item) => item.key.toString()}
                initialNumToRender={3}
                maxToRenderPerBatch={2}
                windowSize={4}
            />
        </View>
    );
});

// Optimized Full Page Loading Skeleton
export const HomePageSkeleton = React.memo(() => (
    <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
    >
        <HeaderSkeleton />
        <SearchBarSkeleton />
        <CategoriesSkeleton />
        <BannerSkeleton />
        <DealsSkeleton />
        <ProductsSkeleton title="Flash Sale" />
        <ProductsSkeleton title="Fresh Fruits" />
        <ProductsSkeleton title="Fresh Bread" />
        <View style={styles.bottomSpacing} />
    </ScrollView>
));

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        flex: 1,
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
    // Header Skeleton Styles
    headerSkeleton: {
        padding: 20,
        paddingTop: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    headerSubtitle: {
        marginTop: 8,
    },
    // Search Bar Skeleton Styles
    searchSkeleton: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        alignItems: 'center',
        marginBottom: 10,
    },
    searchInput: {
        marginRight: 12,
    },
    // Section Header Skeleton Styles
    sectionHeaderSkeleton: {
        paddingHorizontal: 20,
        paddingTop: 25,
        paddingBottom: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionTitle: {
        marginLeft: 8,
    },
    // Categories Skeleton Styles
    categoryRowSkeleton: {
        paddingVertical: 10,
        paddingLeft: 20,
    },
    categoryItemSkeleton: {
        marginRight: 20,
        alignItems: 'center',
        width: 85,
    },
    categoryLabel: {
        marginTop: 8,
    },
    // Banner Skeleton Styles
    bannerSkeleton: {
        margin: 20,
        backgroundColor: '#F8F9FA',
        borderRadius: 25,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 120,
    },
    bannerContent: {
        flex: 1,
    },
    bannerSubtitle: {
        marginTop: 8,
    },
    bannerButton: {
        marginTop: 15,
    },
    // Deal Card Skeleton Styles
    dealCardSkeleton: {
        width: 280,
        marginRight: 15,
        borderRadius: 20,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 6,
        overflow: 'hidden',
    },
    dealContentSkeleton: {
        padding: 15,
    },
    dealPriceRowSkeleton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 10,
        justifyContent: 'space-between',
    },
    dealMetaSkeleton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    dealsContainerSkeleton: {
        paddingLeft: 20,
        paddingBottom: 15,
    },
    // Product Card Skeleton Styles
    productCardSkeleton: {
        backgroundColor: '#fff',
        width: 160,
        marginRight: 15,
        borderRadius: 15,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    productTitle: {
        marginTop: 8,
    },
    productSubtitle: {
        marginTop: 4,
    },
    productPrice: {
        marginTop: 6,
    },
    productButton: {
        marginTop: 8,
    },
    productsContainerSkeleton: {
        paddingLeft: 20,
        paddingBottom: 15,
    },
    bottomSpacing: {
        height: 30,
    },
});