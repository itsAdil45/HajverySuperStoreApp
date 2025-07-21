import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    withDelay,
    interpolate,
} from 'react-native-reanimated';
import { Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
    const logoScale = useSharedValue(0);
    const logoRotation = useSharedValue(0);
    const logoOpacity = useSharedValue(0);
    const backgroundOpacity = useSharedValue(0);
    const pulseScale = useSharedValue(1);

    useEffect(() => {
        // Background fade in
        backgroundOpacity.value = withTiming(1, {
            duration: 800,
        });

        // Logo entrance animation
        logoOpacity.value = withDelay(
            300,
            withTiming(1, {
                duration: 600,
            })
        );

        logoScale.value = withDelay(
            300,
            withSequence(
                withTiming(1.2, {
                    duration: 600,
                }),
                withTiming(1, {
                    duration: 300,
                })
            )
        );

        // Subtle rotation
        logoRotation.value = withDelay(
            300,
            withTiming(360, {
                duration: 1200,
            })
        );

        // Continuous pulse effect
        const startPulse = () => {
            pulseScale.value = withSequence(
                withTiming(1.05, {
                    duration: 1500,
                }),
                withTiming(1, {
                    duration: 1500,
                })
            );
        };

        const pulseTimer = setTimeout(() => {
            startPulse();
            const interval = setInterval(startPulse, 3000);
            return () => clearInterval(interval);
        }, 1200);

        return () => clearTimeout(pulseTimer);
    }, []);

    const backgroundAnimatedStyle = useAnimatedStyle(() => ({
        opacity: backgroundOpacity.value,
    }));

    const logoAnimatedStyle = useAnimatedStyle(() => ({
        opacity: logoOpacity.value,
        transform: [
            { scale: logoScale.value * pulseScale.value },
            { rotate: `${logoRotation.value}deg` },
        ],
    }));

    const shadowAnimatedStyle = useAnimatedStyle(() => {
        const shadowOpacity = interpolate(
            logoOpacity.value,
            [0, 1],
            [0, 0.3]
        );
        return {
            opacity: shadowOpacity,
            transform: [
                { scale: logoScale.value * pulseScale.value * 0.9 },
            ],
        };
    });

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.background, backgroundAnimatedStyle]}>
                <LinearGradient
                    colors={['#E8F5E8', '#F0FFF0', '#FFFFFF']}
                    style={StyleSheet.absoluteFillObject}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
            </Animated.View>

            {/* Animated background circles */}
            <Animated.View style={[styles.circle1, backgroundAnimatedStyle]} />
            <Animated.View style={[styles.circle2, backgroundAnimatedStyle]} />
            <Animated.View style={[styles.circle3, backgroundAnimatedStyle]} />

            <View style={styles.logoContainer}>
                {/* Logo shadow */}
                <Animated.View style={[styles.logoShadow, shadowAnimatedStyle]} />

                {/* Main logo */}
                <Animated.View style={logoAnimatedStyle}>
                    <Image
                        source={require('../assets/Logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </Animated.View>
            </View>

            {/* Floating particles */}
            <Animated.View style={[styles.particle1, backgroundAnimatedStyle]} />
            <Animated.View style={[styles.particle2, backgroundAnimatedStyle]} />
            <Animated.View style={[styles.particle3, backgroundAnimatedStyle]} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    background: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 280,
        height: 280,
    },
    logoShadow: {
        position: 'absolute',
        width: 280,
        height: 280,
        backgroundColor: '#00C851',
        borderRadius: 140,
        opacity: 0.1,
        top: 10,
    },
    circle1: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#00C851',
        opacity: 0.05,
        top: height * 0.1,
        left: -100,
    },
    circle2: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#4CAF50',
        opacity: 0.08,
        bottom: height * 0.15,
        right: -75,
    },
    circle3: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#81C784',
        opacity: 0.06,
        top: height * 0.2,
        right: width * 0.2,
    },
    particle1: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#00C851',
        opacity: 0.4,
        top: height * 0.25,
        left: width * 0.15,
    },
    particle2: {
        position: 'absolute',
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#4CAF50',
        opacity: 0.5,
        bottom: height * 0.3,
        left: width * 0.25,
    },
    particle3: {
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#81C784',
        opacity: 0.3,
        top: height * 0.35,
        right: width * 0.15,
    },
});

export default SplashScreen;