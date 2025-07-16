import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    TextInput,
} from 'react-native';

const OtpModal = ({ visible, phone, onVerify, onResend }) => {
    const [otp, setOtp] = useState(['', '', '', '']);
    const [timer, setTimer] = useState(30);

    useEffect(() => {
        if (!visible) return;
        setOtp(['', '', '', '']);
        setTimer(30);
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, [visible]);

    const handleChange = (value, index) => {
        if (value.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
    };

    const otpCode = otp.join('');

    return (
        <Modal transparent animationType="fade" visible={visible}>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.title}>Enter OTP</Text>
                    <Text style={styles.message}>
                        A verification code has been sent to {phone}
                    </Text>

                    <View style={styles.otpRow}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                style={styles.otpInput}
                                keyboardType="number-pad"
                                maxLength={1}
                                value={digit}
                                onChangeText={(value) => handleChange(value, index)}
                            />
                        ))}
                    </View>

                    <TouchableOpacity
                        style={styles.verifyButton}
                        onPress={() => onVerify(otpCode)}
                        disabled={otpCode.length !== 4}
                    >
                        <Text style={styles.verifyText}>Verify</Text>
                    </TouchableOpacity>

                    <Text style={styles.resendText}>
                        Didn’t receive the code?{' '}
                        <Text
                            style={{ color: timer === 0 ? '#4CAF50' : '#999' }}
                            onPress={() => timer === 0 && onResend()}
                        >
                            Resend ({timer}s)
                        </Text>
                    </Text>
                </View>
            </View>
        </Modal>
    );
};

export default OtpModal;

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
        alignItems: 'center',
    },
    title: {
        fontWeight: '600',
        fontSize: 18,
        marginBottom: 4,
    },
    message: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 16,
    },
    otpRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    otpInput: {
        width: 50,
        height: 50,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        textAlign: 'center',
        fontSize: 18,
        marginHorizontal: 5,
    },
    verifyButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 50,
        marginBottom: 16,
    },
    verifyText: {
        color: '#fff',
        fontWeight: '600',
    },
    resendText: {
        fontSize: 13,
        color: '#444',
    },
});
