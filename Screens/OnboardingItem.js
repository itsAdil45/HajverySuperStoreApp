import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';

const OnboardingItem = ({ image, title, description, onNext, onSkip, showSkip }) => {
    return (
        <View style={styles.container}>
            {/* {showSkip && (
                <TouchableOpacity onPress={onSkip} style={styles.skip}>
                    <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
            )} */}
            <Image source={image} style={styles.image} />

            <ImageBackground
                source={require('../assets/shape.png')}
                style={styles.contentBackground}
                resizeMode="contain"
            >
                <View style={{ paddingHorizontal: 40 }}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.desc}>{description}</Text>
                </View>
                <TouchableOpacity onPress={onNext} style={styles.button}>
                    <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F1FFF2',
        alignItems: 'center',
        paddingTop: 40,
    },
    skip: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 1,
    },
    skipText: {
        color: '#00C851',
        fontWeight: '500',
    },
    image: {
        width: 320,
        height: 320,
        resizeMode: 'contain',
        marginTop: 40,
    },
    contentBackground: {
        width: '100%',
        height: 250,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 0,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    desc: {
        fontSize: 14,
        textAlign: 'center',
        color: '#777',
        paddingHorizontal: 10,
    },
    button: {
        marginTop: 20,
        backgroundColor: '#00C851',
        padding: 15,
        borderRadius: 30,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
    },
});

export default OnboardingItem;