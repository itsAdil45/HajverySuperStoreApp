import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';

const ConfirmationModal = ({ visible, onNext }) => {
    return (
        <Modal transparent animationType="fade" visible={visible}>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.title}>Account Created </Text>
                    <Text style={styles.phone}>Successfully</Text>
                    <Text style={styles.message}>
                        Redirect to login screen for authentication
                    </Text>
                    <View style={styles.buttons}>
                        <TouchableOpacity style={styles.next} onPress={onNext}>
                            <Text style={styles.nextText}>Next</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default ConfirmationModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: '#0005',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        elevation: 5,
    },
    title: {
        fontWeight: '800',
        fontSize: 25,
        textAlign: 'center',
        marginBottom: 8,
    },
    phone: {
        fontSize: 20,
        fontWeight: 800,
        textAlign: 'center',
        marginBottom: 12,
    },
    message: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    cancel: {
        borderWidth: 1,
        borderColor: '#4CAF50',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    cancelText: {
        color: '#4CAF50',
        fontWeight: '500',
    },
    next: {
        backgroundColor: '#4CAF50',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    nextText: {
        color: '#fff',
        fontWeight: '500',
    },
});
