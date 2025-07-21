import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    withSpring,
    runOnJS,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const OnboardingItem = ({ image, title, description, onNext, onSkip, showSkip }) => {
    const imageOpacity = useSharedValue(0);
    const imageTranslateY = useSharedValue(30);

    const contentOpacity = useSharedValue(0);
    const contentTranslateY = useSharedValue(50);

    const buttonScale = useSharedValue(0.95);
    const buttonOpacity = useSharedValue(0);

    const animateButton = () => {
        buttonScale.value = withSpring(0.95, { damping: 10 });
        setTimeout(() => {
            buttonScale.value = withSpring(1, { damping: 10 });
        }, 100);
    };

    useEffect(() => {
        // Image entrance animation
        imageOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
        imageTranslateY.value = withDelay(200, withSpring(0, { damping: 12 }));

        // Content entrance animation
        contentOpacity.value = withDelay(500, withTiming(1, { duration: 500 }));
        contentTranslateY.value = withDelay(500, withSpring(0, { damping: 12 }));

        // Button entrance animation
        buttonOpacity.value = withDelay(800, withTiming(1, { duration: 400 }));
        buttonScale.value = withDelay(800, withSpring(1, { damping: 8 }));
    }, []);

    const imageAnimatedStyle = useAnimatedStyle(() => ({
        opacity: imageOpacity.value,
        transform: [{ translateY: imageTranslateY.value }],
    }));

    const contentAnimatedStyle = useAnimatedStyle(() => ({
        opacity: contentOpacity.value,
        transform: [{ translateY: contentTranslateY.value }],
    }));

    const buttonAnimatedStyle = useAnimatedStyle(() => ({
        opacity: buttonOpacity.value,
        transform: [{ scale: buttonScale.value }],
    }));

    const handleButtonPress = () => {
        runOnJS(animateButton)();
        setTimeout(() => {
            onNext && onNext();
        }, 150);
    };

    return (
        <View style={styles.container}>
            {/* Simple decorative circles */}
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />

            {/* Skip button */}
            {showSkip && (
                <TouchableOpacity onPress={onSkip} style={styles.skip}>
                    <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
            )}

            {/* Main image */}
            <Animated.View style={[styles.imageContainer, imageAnimatedStyle]}>
                <View style={styles.imageShadow} />
                <Image source={image} style={styles.image} resizeMode="contain" />
            </Animated.View>

            {/* Content section */}
            <Animated.View style={[styles.contentSection, contentAnimatedStyle]}>
                <View style={styles.contentContainer}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.description}>{description}</Text>

                    <Animated.View style={buttonAnimatedStyle}>
                        <TouchableOpacity
                            onPress={handleButtonPress}
                            style={styles.button}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.buttonText}>Next</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F1FFF2',
        alignItems: 'center',
    },
    decorativeCircle1: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#00C851',
        opacity: 0.06,
        top: height * 0.1,
        left: -40,
    },
    decorativeCircle2: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#4CAF50',
        opacity: 0.08,
        top: height * 0.2,
        right: -20,
    },
    skip: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 20,
    },
    skipText: {
        color: '#00C851',
        fontWeight: '600',
        fontSize: 16,
    },
    imageContainer: {
        marginTop: height * 0.12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageShadow: {
        position: 'absolute',
        width: 280,
        height: 280,
        borderRadius: 140,
        backgroundColor: '#00C851',
        opacity: 0.08,
        top: 15,
    },
    image: {
        width: 300,
        height: 300,
    },
    contentSection: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: 'white',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingTop: 40,
        paddingBottom: 50,
        paddingHorizontal: 32,
        // Simple shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    contentContainer: {
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 200,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        color: '#1a1a1a',
        marginBottom: 16,
        lineHeight: 30,
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        color: '#666',
        lineHeight: 24,
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    button: {
        backgroundColor: '#00C851',
        paddingHorizontal: 48,
        paddingVertical: 16,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        // Simple shadow
        shadowColor: '#00C851',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
});

export default OnboardingItem;