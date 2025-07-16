import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const SplashScreen = () => {
    return (
        <View style={styles.container}>
            <View style={{ display: 'flex', alignItems: "center", justifyContent: "center" }}>
                <Image source={require('../assets/Logo.png')} style={styles.logo} />
            </View>

            {/* <Image source={require('../assets/shape_2.png')} style={styles.bottomImage} /> */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },
    logo: {
        width: 300,
        height: 300,
        resizeMode: 'contain',
    },
    bottomImage: {
        width: '100%',
        height: 300,
        marginBottom: 50,
    },
});

export default SplashScreen;
