import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BaseToast, ErrorToast } from 'react-native-toast-message';

export const toastConfig = {
    // Custom type 1: Modified base toast
    success: (props) => (
        <BaseToast
            {...props}
            style={{ borderLeftColor: 'green', backgroundColor: '#e0ffe0' }}
            contentContainerStyle={{ paddingHorizontal: 15 }}
            text1Style={{ fontSize: 16, fontWeight: 'bold' }}
            text2Style={{ fontSize: 14, color: '#333' }}
        />
    ),

    // Custom type 2: Your own layout
    myCustomToast: ({ text1, text2, props }) => (
        <View style={styles.customToast}>
            <Text style={styles.title}>{text1}</Text>
            <Text style={styles.message}>{text2}</Text>
        </View>
    ),
};

const styles = StyleSheet.create({
    customToast: {
        height: 80,
        width: '90%',
        backgroundColor: '#007aff',
        padding: 15,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    message: { color: 'white', fontSize: 14 },
});
