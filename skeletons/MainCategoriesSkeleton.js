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
const CARD_WIDTH = (width - 48) / 2;

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

const CategoryCardSkeleton = () => (
    <View style={styles.categoryCard}>
        <SkeletonBox
            width={60}
            height={60}
            style={styles.categoryImage}
        />
        <SkeletonBox
            width={CARD_WIDTH - 64}
            height={16}
            style={styles.categoryName}
        />
        <SkeletonBox
            width={CARD_WIDTH - 80}
            height={12}
            style={styles.categoryDescription}
        />
    </View>
);

export const MainCategoriesSkeleton = React.memo(() => {
    return (
        <View style={styles.container}>
            {/* Search Bar Skeleton */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <SkeletonBox
                        width={width - 100}
                        height={40}
                        style={styles.searchInput}
                    />
                </View>
                <View style={styles.searchButton}>
                    <SkeletonBox width={50} height={40} />
                </View>
            </View>

            {/* Categories Grid Skeleton */}
            <View style={styles.listContainer}>
                <View style={styles.row}>
                    {[1, 2].map(index => (
                        <CategoryCardSkeleton key={`row1-${index}`} />
                    ))}
                </View>
                <View style={styles.row}>
                    {[1, 2].map(index => (
                        <CategoryCardSkeleton key={`row2-${index}`} />
                    ))}
                </View>
                <View style={styles.row}>
                    {[1, 2].map(index => (
                        <CategoryCardSkeleton key={`row3-${index}`} />
                    ))}
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#f9f9f9',
        gap: 12,
    },
    searchBox: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        overflow: 'hidden',
    },
    searchInput: {
        borderRadius: 12,
    },
    searchButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    listContainer: {
        padding: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    categoryCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        width: CARD_WIDTH,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    categoryImage: {
        borderRadius: 30,
        marginBottom: 12,
    },
    categoryName: {
        marginBottom: 8,
    },
    categoryDescription: {
        marginBottom: 4,
    },
});