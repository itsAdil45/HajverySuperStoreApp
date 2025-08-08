import React, { useMemo } from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    FlatList,
    ScrollView,
    StatusBar,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    interpolate,
    Easing
} from 'react-native-reanimated';
import appColors from '../colors/appColors';

const { width, height } = Dimensions.get('window');

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

// All Deals Page Header Skeleton
const AllDealsHeaderSkeleton = React.memo(() => (
    <View style={styles.headerContainer}>
        <View style={styles.headerGradient}>
            <View style={styles.headerContent}>
                <SkeletonBox
                    width={40}
                    height={40}
                    borderRadius={20}
                    style={styles.backButtonSkeleton}
                    disableShimmer
                />

                <View style={styles.headerTitleContainer}>
                    <SkeletonBox width={120} height={24} borderRadius={6} />
                    <View style={styles.headerSubtitleSkeleton}>
                        <SkeletonBox width={180} height={14} borderRadius={4} />
                    </View>
                </View>

                <SkeletonBox
                    width={40}
                    height={40}
                    borderRadius={20}
                    style={styles.filterButtonSkeleton}
                    disableShimmer
                />
            </View>
        </View>
    </View>
));

// Deal Card Skeleton for All Deals
const DealCardSkeleton = React.memo(() => (
    <View style={styles.dealCard}>
        {/* Image Section */}
        <View style={styles.dealImageContainer}>
            <SkeletonBox
                width={width - 32}
                height={200}
                borderRadius={0}
                style={styles.dealImageSkeleton}
                disableShimmer
            />

            {/* Discount Badge */}
            <SkeletonBox
                width={60}
                height={45}
                borderRadius={20}
                style={styles.discountBadgeSkeleton}
                disableShimmer
            />

            {/* Time Badge */}
            <SkeletonBox
                width={80}
                height={28}
                borderRadius={20}
                style={styles.timeBadgeSkeleton}
                disableShimmer
            />

            {/* Heart Button */}
            <SkeletonBox
                width={36}
                height={36}
                borderRadius={18}
                style={styles.heartButtonSkeleton}
                disableShimmer
            />
        </View>

        {/* Content Section */}
        <View style={styles.dealContent}>
            {/* Title Section */}
            <View style={styles.titleSection}>
                <SkeletonBox width={280} height={18} borderRadius={4} />
                <View style={styles.titleLine2}>
                    <SkeletonBox width={220} height={18} borderRadius={4} />
                </View>
                <View style={styles.descriptionSkeleton}>
                    <SkeletonBox width={260} height={14} borderRadius={4} />
                    <View style={styles.descriptionLine2}>
                        <SkeletonBox width={180} height={14} borderRadius={4} />
                    </View>
                </View>
            </View>

            {/* Featured Product */}
            <View style={styles.featuredProduct}>
                <SkeletonBox width={60} height={16} borderRadius={8} />
                <View style={styles.productNameSkeleton}>
                    <SkeletonBox width={140} height={14} borderRadius={4} />
                </View>
            </View>

            {/* Price Section */}
            <View style={styles.priceContainer}>
                <View style={styles.priceRow}>
                    <SkeletonBox width={80} height={28} borderRadius={6} />
                    <SkeletonBox width={60} height={16} borderRadius={4} />
                </View>
                <View style={styles.savingsChipSkeleton}>
                    <SkeletonBox width={100} height={20} borderRadius={10} />
                </View>
            </View>

            {/* Products Info */}
            <View style={styles.productsInfo}>
                <SkeletonBox width={80} height={24} borderRadius={12} />
                <SkeletonBox width={100} height={24} borderRadius={12} />
            </View>
        </View>
    </View>
));

// All Deals Page Skeleton
export const AllDealsSkeleton = React.memo(({ itemCount = 5 }) => {
    const dealsData = useMemo(() => Array(itemCount).fill(0).map((_, i) => ({ key: i })), [itemCount]);

    return (
        <View style={styles.container}>
            <AllDealsHeaderSkeleton />

            <FlatList
                data={dealsData}
                keyExtractor={(item) => item.key.toString()}
                renderItem={() => <DealCardSkeleton />}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                initialNumToRender={3}
                maxToRenderPerBatch={2}
                windowSize={4}
            />
        </View>
    );
});

// Deal Details Hero Section Skeleton
const DealDetailsHeroSkeleton = React.memo(() => (
    <View style={styles.heroContainer}>
        <SkeletonBox
            width={width}
            height={300}
            borderRadius={0}
            style={styles.heroImageSkeleton}
            disableShimmer
        />

        {/* Floating Back Button */}
        <SkeletonBox
            width={44}
            height={44}
            borderRadius={22}
            style={styles.floatingBackBtn}
            disableShimmer
        />

        {/* Floating Share Button */}
        <SkeletonBox
            width={44}
            height={44}
            borderRadius={22}
            style={styles.floatingShareBtn}
            disableShimmer
        />

        {/* Hero Badge */}
        <SkeletonBox
            width={70}
            height={55}
            borderRadius={25}
            style={styles.heroBadgeSkeleton}
            disableShimmer
        />

        {/* Timer Badge */}
        <SkeletonBox
            width={90}
            height={32}
            borderRadius={20}
            style={styles.heroTimerSkeleton}
            disableShimmer
        />
    </View>
));

// Price Card Skeleton for Deal Details
const PriceCardSkeleton = React.memo(() => (
    <View style={styles.priceCard}>
        <View style={styles.priceGradient}>
            <View style={styles.priceHeader}>
                <SkeletonBox width={120} height={16} borderRadius={4} />
            </View>

            <View style={styles.priceRowDetails}>
                <SkeletonBox width={120} height={32} borderRadius={6} />
                <SkeletonBox width={80} height={18} borderRadius={4} />
            </View>

            <View style={styles.savingsRowSkeleton}>
                <SkeletonBox width={140} height={14} borderRadius={4} />
            </View>
        </View>
    </View>
));

// Status Card Skeleton for Deal Details
const StatusCardSkeleton = React.memo(() => (
    <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
            <SkeletonBox width={100} height={16} borderRadius={4} />
        </View>

        <View style={styles.statusContent}>
            <SkeletonBox width={80} height={24} borderRadius={20} />
            <View style={styles.validityTextSkeleton}>
                <SkeletonBox width={180} height={14} borderRadius={4} />
            </View>
        </View>
    </View>
));

// Product Card Skeleton for Deal Details
const ProductCardDetailsSkeleton = React.memo(() => (
    <View style={styles.productCardDetails}>
        <View style={styles.productImageContainerDetails}>
            <SkeletonBox
                width="100%"
                height={120}
                borderRadius={0}
                style={styles.productImageDetails}
                disableShimmer
            />

            {/* Sale Badge */}
            <SkeletonBox
                width={35}
                height={16}
                borderRadius={8}
                style={styles.saleBadgeSkeleton}
                disableShimmer
            />

            {/* Stock Dot */}
            <SkeletonBox
                width={8}
                height={8}
                borderRadius={4}
                style={styles.stockDotSkeleton}
                disableShimmer
            />
        </View>

        <View style={styles.productContentDetails}>
            <View style={styles.productHeaderDetails}>
                <SkeletonBox width={60} height={11} borderRadius={4} />
                <SkeletonBox width={24} height={24} borderRadius={12} disableShimmer />
            </View>

            <SkeletonBox width="90%" height={14} borderRadius={4} />
            <View style={styles.productNameLine2}>
                <SkeletonBox width="60%" height={14} borderRadius={4} />
            </View>

            <View style={styles.priceContainerDetails}>
                <SkeletonBox width={70} height={16} borderRadius={4} />
                <SkeletonBox width={50} height={12} borderRadius={4} />
            </View>

            <View style={styles.stockRowSkeleton}>
                <SkeletonBox width={60} height={11} borderRadius={4} />
            </View>
        </View>
    </View>
));

// Deal Details Page Skeleton
export const DealDetailsSkeleton = React.memo(() => {
    const productsData = useMemo(() => Array(4).fill(0).map((_, i) => ({ key: i })), []);

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Section */}
                <DealDetailsHeroSkeleton />

                {/* Content Container */}
                <View style={styles.contentContainer}>
                    {/* Title Section */}
                    <View style={styles.titleSectionDetails}>
                        <SkeletonBox width="90%" height={24} borderRadius={6} />
                        <View style={styles.titleLine2Details}>
                            <SkeletonBox width="70%" height={24} borderRadius={6} />
                        </View>
                        <View style={styles.descriptionSkeletonDetails}>
                            <SkeletonBox width="95%" height={16} borderRadius={4} />
                            <View style={styles.descriptionLine2Details}>
                                <SkeletonBox width="80%" height={16} borderRadius={4} />
                            </View>
                        </View>
                    </View>

                    {/* Price Card */}
                    <PriceCardSkeleton />

                    {/* Status Card */}
                    <StatusCardSkeleton />

                    {/* Products Section */}
                    <View style={styles.productsSectionDetails}>
                        <View style={styles.sectionHeaderDetails}>
                            <SkeletonBox width={180} height={18} borderRadius={4} />
                        </View>

                        <View style={styles.productsGrid}>
                            {productsData.map((item, index) => (
                                <View key={item.key} style={styles.productRowItem}>
                                    <ProductCardDetailsSkeleton />
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* FAB Skeleton */}
            <View style={styles.fabContainer}>
                <SkeletonBox
                    width={width - 40}
                    height={56}
                    borderRadius={25}
                    style={styles.fabSkeleton}
                    disableShimmer
                />
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
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

    // All Deals Header Styles
    headerContainer: {
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    headerGradient: {
        paddingTop: StatusBar.currentHeight || 44,
        paddingBottom: 20,
        backgroundColor: appColors.darkerBg,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    backButtonSkeleton: {
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    headerTitleContainer: {
        flex: 1,
        marginLeft: 15,
    },
    headerSubtitleSkeleton: {
        marginTop: 4,
    },
    filterButtonSkeleton: {
        backgroundColor: 'rgba(255,255,255,0.3)',
    },

    // All Deals List Styles
    listContainer: {
        padding: 16,
        paddingBottom: 100,
    },
    dealCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 8,
        overflow: 'hidden',
    },
    dealImageContainer: {
        height: 200,
        position: 'relative',
        overflow: 'hidden',
    },
    dealImageSkeleton: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    discountBadgeSkeleton: {
        position: 'absolute',
        top: 15,
        right: 15,
        backgroundColor: 'rgba(244, 162, 97, 0.3)',
    },
    timeBadgeSkeleton: {
        position: 'absolute',
        bottom: 15,
        left: 15,
        backgroundColor: 'rgba(255,255,255,0.8)',
    },
    heartButtonSkeleton: {
        position: 'absolute',
        top: 15,
        left: 15,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    dealContent: {
        padding: 20,
    },
    titleSection: {
        marginBottom: 12,
    },
    titleLine2: {
        marginTop: 4,
    },
    descriptionSkeleton: {
        marginTop: 8,
    },
    descriptionLine2: {
        marginTop: 3,
    },
    featuredProduct: {
        marginBottom: 15,
    },
    productNameSkeleton: {
        marginTop: 4,
    },
    priceContainer: {
        marginBottom: 15,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 8,
        gap: 12,
    },
    savingsChipSkeleton: {
        alignSelf: 'flex-start',
    },
    productsInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    // Deal Details Styles
    scrollView: {
        flex: 1,
    },
    heroContainer: {
        height: 300,
        position: 'relative',
    },
    heroImageSkeleton: {
        width: '100%',
        height: '100%',
    },
    floatingBackBtn: {
        position: 'absolute',
        top: StatusBar.currentHeight + 20 || 60,
        left: 20,
        backgroundColor: 'rgba(14,90,166,0.4)',
    },
    floatingShareBtn: {
        position: 'absolute',
        top: StatusBar.currentHeight + 20 || 60,
        right: 20,
        backgroundColor: 'rgba(14,90,166,0.4)',
    },
    heroBadgeSkeleton: {
        position: 'absolute',
        top: 100,
        right: 20,
        backgroundColor: 'rgba(244, 162, 97, 0.3)',
    },
    heroTimerSkeleton: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        backgroundColor: 'rgba(255,255,255,0.8)',
    },
    contentContainer: {
        backgroundColor: appColors.Background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: -24,
        paddingTop: 24,
        paddingHorizontal: 20,
        paddingBottom: 120,
    },
    titleSectionDetails: {
        marginBottom: 20,
    },
    titleLine2Details: {
        marginTop: 6,
    },
    descriptionSkeletonDetails: {
        marginTop: 12,
    },
    descriptionLine2Details: {
        marginTop: 4,
    },

    // Price Card Styles
    priceCard: {
        marginBottom: 20,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#f0f7ff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    priceGradient: {
        padding: 20,
    },
    priceHeader: {
        marginBottom: 12,
    },
    priceRowDetails: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 12,
        gap: 16,
    },
    savingsRowSkeleton: {
        alignSelf: 'flex-start',
    },

    // Status Card Styles
    statusCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderLeftWidth: 4,
        borderLeftColor: '#0e5aa6',
    },
    statusHeader: {
        marginBottom: 12,
    },
    statusContent: {
        gap: 8,
    },
    validityTextSkeleton: {
        marginTop: 4,
    },

    // Products Section Styles
    productsSectionDetails: {
        marginTop: 8,
    },
    sectionHeaderDetails: {
        marginBottom: 16,
    },
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    productRowItem: {
        width: '48%',
    },
    productCardDetails: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderTopWidth: 2,
        borderTopColor: '#d9e6f2',
        marginBottom: 12,
    },
    productImageContainerDetails: {
        height: 120,
        position: 'relative',
    },
    productImageDetails: {
        width: '100%',
        height: '100%',
    },
    saleBadgeSkeleton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(244, 162, 97, 0.3)',
    },
    stockDotSkeleton: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: '#00C851',
    },
    productContentDetails: {
        padding: 12,
    },
    productHeaderDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    productNameLine2: {
        marginTop: 4,
    },
    priceContainerDetails: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 6,
        gap: 6,
    },
    stockRowSkeleton: {
        alignItems: 'flex-start',
    },

    // FAB Styles
    fabContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        zIndex: 10,
    },
    fabSkeleton: {
        backgroundColor: 'rgba(14, 90, 166, 0.3)',
        shadowColor: '#0e5aa6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 8,
    },
});