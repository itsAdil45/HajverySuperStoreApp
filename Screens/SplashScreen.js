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
import appColors from '../colors/appColors';

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
        // logoRotation.value = withDelay(
        //     300,
        //     withTiming(360, {
        //         duration: 1200,
        //     })
        // );

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
                {/* <LinearGradient
                    colors={['#E8F5E8', '#F0FFF0', '#FFFFFF']}
                    style={StyleSheet.absoluteFillObject}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                /> */}
            </Animated.View>

            {/* Animated background circles */}
            {/* <Animated.View style={[styles.circle1, backgroundAnimatedStyle]} />
            <Animated.View style={[styles.circle2, backgroundAnimatedStyle]} />
            <Animated.View style={[styles.circle3, backgroundAnimatedStyle]} /> */}

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
            {/* <Animated.View style={[styles.particle1, backgroundAnimatedStyle]} />
            <Animated.View style={[styles.particle2, backgroundAnimatedStyle]} />
            <Animated.View style={[styles.particle3, backgroundAnimatedStyle]} /> */}
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
        backgroundColor: appColors.Primary_Button,
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 350,
        height: 350,
    },
    logoShadow: {
        position: 'absolute',

        backgroundColor: '#dde8f3ff',
        borderRadius: 140,
        opacity: 0.1,
        top: 10,
    },

});

export default SplashScreen;