import React, { useState, useEffect } from 'react';
import {
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    Alert,
    View
} from 'react-native';
import OtpModal from '../Modals/OtpModal';
import usePost from '../hooks/usePost';
import { Eye, EyeOff } from 'lucide-react-native';
import appColors from '../colors/appColors';

const UserAuthScreen = ({ route, navigation }) => {
    const { post, loading, error } = usePost();
    const [email, setEmail] = useState('');
    const [showOtpModal, setshowOtpModal] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [hidePassword, setHidePassword] = useState(true);
    const [hideConfirmPassword, setHideConfirmPassword] = useState(true);
    const [requestType, setRequestType] = useState(null);
    const [otpSent, setOtpSent] = useState(false);
    const [otpSentMessage, setOtpSentMessage] = useState("");

    useEffect(() => {
        const { email, type } = route.params || {};

        if (email || type) {
            setEmail(email);
            setRequestType(type);
        }

        // Clear params after use
        if (email) {
            navigation.setParams({
                email: undefined,
                type: undefined
            });
        }
    }, [route.params]);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        // At least 6 characters, you can make this more strict
        return password.length >= 6;
    };

    const handleSendOtp = async () => {
        if (!email || !validateEmail(email)) {
            Alert.alert("Validation Error", "Please enter a valid email address");
            return;
        }

        try {
            const response = await post(`/api/auth/request-reset-otp/${requestType}`, { email });

            if (response) {
                if (requestType === "email") {
                    setshowOtpModal(true);
                } else if (requestType === "password") {
                    setOtpSent(true);
                    setOtpSentMessage("Password reset OTP has been sent to your email");
                }
            }
        } catch (error) {
            console.log(error);
            Alert.alert('Error', error.message || 'Failed to send OTP');
        }
    };

    const handlePasswordReset = async () => {
        // Validation
        if (!email || !validateEmail(email)) {
            Alert.alert("Validation Error", "Please enter a valid email address");
            return;
        }

        if (!password || !validatePassword(password)) {
            Alert.alert("Validation Error", "Password must be at least 6 characters long");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Validation Error", "Passwords do not match");
            return;
        }

        if (!otp || otp.length < 4) {
            Alert.alert("Validation Error", "Please enter a valid OTP");
            return;
        }

        try {
            const response = await post('/api/auth/reset-password-otp', {
                email,
                otp: parseInt(otp),
                newPassword: password
            });
            if (response && response.status === 'success') {
                Alert.alert(
                    "Success",

                    "Password has been reset successfully",
                    [
                        {
                            text: "OK",
                            onPress: () => {
                                navigation.goBack();
                            }
                        }
                    ]
                );
            } else {
                Alert.alert('Error', response?.message || 'Failed to reset password');
            }
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to reset password');
        }
    };

    const handleMainAction = () => {
        if (requestType === "password" && otpSent) {
            handlePasswordReset();
        } else {
            handleSendOtp();
        }
    };

    const getButtonText = () => {
        if (requestType === "password" && otpSent) {
            return "Reset Password";
        }
        return "Send OTP";
    };

    const getTitle = () => {
        return requestType === "email" ? "Verify Email" : "Reset Password";
    };

    const getSubtitle = () => {
        if (requestType === "password" && otpSent) {
            return "Enter your new password and OTP";
        }
        return "Enter your email to receive OTP";
    };

    const renderPasswordResetFields = () => {
        if (requestType !== "password" || !otpSent) return null;
        return (
            <View>
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.inputPassword}
                        placeholder="New Password"
                        value={password}
                        secureTextEntry={hidePassword}
                        onChangeText={setPassword}
                    />
                    <TouchableOpacity onPress={() => setHidePassword(!hidePassword)}>
                        {hidePassword ? <EyeOff size={20} color="#777" /> : <Eye size={20} color="#777" />}
                    </TouchableOpacity>
                </View>

                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.inputPassword}
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        secureTextEntry={hideConfirmPassword}
                        onChangeText={setConfirmPassword}
                    />
                    <TouchableOpacity onPress={() => setHideConfirmPassword(!hideConfirmPassword)}>
                        {hideConfirmPassword ? <EyeOff size={20} color="#777" /> : <Eye size={20} color="#777" />}
                    </TouchableOpacity>
                </View>

                <View style={styles.otpContainer}>
                    <TextInput
                        style={styles.inputOtp}
                        placeholder="Enter OTP"
                        value={otp}
                        keyboardType="numeric"
                        maxLength={6}
                        onChangeText={setOtp}
                    />
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <Image source={require('../assets/login.png')} style={styles.logo} />
            <Text style={styles.title}>{getTitle()}</Text>
            <Text style={styles.subtitle}>{getSubtitle()}</Text>

            <TextInput
                style={[
                    styles.input,
                    requestType === "email" ? styles.disabledInput : null
                ]}
                placeholder="Email"
                value={email}
                editable={requestType !== "email"}
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={setEmail}
                placeholderTextColor={"#777"}
            />

            {renderPasswordResetFields()}

            <TouchableOpacity
                style={[styles.loginButton, loading && styles.disabledButton]}
                onPress={handleMainAction}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.loginButtonText}>
                        {getButtonText()}
                    </Text>
                )}
            </TouchableOpacity>

            {otpSentMessage ? (
                <Text style={styles.successMessage}>{otpSentMessage}</Text>
            ) : null}

            {/* Resend OTP option for password reset */}
            {requestType === "password" && otpSent && (
                <TouchableOpacity
                    style={styles.resendButton}
                    onPress={handleSendOtp}
                    disabled={loading}
                >
                    <Text style={styles.resendText}>Resend OTP</Text>
                </TouchableOpacity>
            )}

            <OtpModal
                visible={showOtpModal}
                email={email}
                onVerify={async (otpCode) => {
                    try {
                        const verifyRes = await post('/api/auth/verify-email', {
                            email,
                            otp: otpCode
                        });

                        if (verifyRes?.status === 'success') {
                            setshowOtpModal(false);
                            Alert.alert(
                                "Success",
                                "Email verified successfully",
                                [
                                    {
                                        text: "OK",
                                        onPress: () => {
                                            navigation.goBack();
                                        }
                                    }
                                ]
                            );
                        } else {
                            Alert.alert('Verification Failed', verifyRes?.message || 'Invalid OTP');
                        }
                    } catch (err) {
                        console.error('OTP Verification Error:', err);
                        Alert.alert('Error', 'Something went wrong verifying OTP');
                    }
                }}
                onResend={handleSendOtp}
            />
        </SafeAreaView>
    );
};

export default UserAuthScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        backgroundColor: 'white',
    },
    logo: {
        width: 140,
        height: 140,
        alignSelf: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#888',
        marginBottom: 20,
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        fontSize: 16,
        paddingVertical: 8,
        marginBottom: 16,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginBottom: 16,
    },
    inputPassword: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 8,
    },
    otpContainer: {
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginBottom: 16,
    },
    inputOtp: {
        fontSize: 16,
        paddingVertical: 8,
        textAlign: 'center',
        letterSpacing: 2,
    },
    loginButton: {
        backgroundColor: appColors.Primary_Button,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 16,
    },
    disabledButton: {
        backgroundColor: '#a5d6a7',
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    successMessage: {
        color: appColors.Hover_Button,
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 16,
    },
    resendButton: {
        alignSelf: 'center',
        paddingVertical: 8,
    },
    resendText: {
        color: '#4CAF50',
        fontSize: 14,
        fontWeight: '500',
    },
    disabledInput: {
        backgroundColor: '#f1f3f4',
        color: '#666',
    },
});