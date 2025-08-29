import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Image,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import OtpModal from '../Modals/OtpModal';
import ConfirmationModal from '../Modals/ConfirmationModal';
import usePost from '../hooks/usePost';
import appColors from '../colors/appColors';
import Toast from 'react-native-toast-message';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

const SignupScreen = ({ navigation, route }) => {
    const { post, loading, error } = usePost();

    // Form Fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [address, setAddress] = useState('');
    const [hidePassword, setHidePassword] = useState(true);

    // Modal States
    const [showVerifyPrompt, setShowVerifyPrompt] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);

    // FCM Token
    const [fcmToken, setFcmToken] = useState(null);
    const notificationListener = useRef();
    const responseListener = useRef();

    useEffect(() => {
        const { selectedAddress, formData } = route.params || {};

        if (selectedAddress) {
            setAddress(selectedAddress);
        }

        if (formData) {
            const { name = '', email = '', password = '', phone = '' } = formData;
            setName(name);
            setEmail(email);
            setPhone(phone);
            setPassword(password);
        }

        // Clear params after use
        if (selectedAddress || formData) {
            navigation.setParams({
                selectedAddress: undefined,
                formData: undefined,
            });
        }
    }, [route.params]);

    const handleRegister = async () => {
        // Validate all fields
        if (!name || !email || !phone || !password || !address) {
            Toast.show({
                type: 'error',
                text1: 'Required fields',
                text2: 'Please fill in all required fields.',
                position: 'top',
            });
            return;
        }

        const userData = {
            name,
            email,
            phone,
            password,
            address,
            // fcmToken
        };

        console.log('Registering User:', userData);
        const result = await post('/api/auth/register', userData);

        if (result) {
            setShowOtpModal(true);
        } else {
            Toast.show({
                type: 'error',
                text1: 'Registration Error',
                text2: 'Failed to register. Please try again',
                position: 'top',
            });
        }
    };

    const handleAddressSelection = () => {
        navigation.replace('LocationPickerScreen', {
            returnScreen: 'SignUp',
            formData: { name, email, password, phone }
        });
    };

    const handleBackToLogin = () => {
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    bounces={true}
                    scrollEventThrottle={16}
                >
                    <View style={styles.header}>
                        <Image
                            source={require('../assets/login.png')}
                            style={styles.logo}
                        />
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Join us and start shopping today</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your full name"
                                value={name}
                                onChangeText={setName}
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email Address</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your email"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Phone Number</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your phone number"
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder="Create a strong password"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={hidePassword}
                                    placeholderTextColor="#999"
                                />
                                <TouchableOpacity
                                    onPress={() => setHidePassword(!hidePassword)}
                                    style={styles.eyeButton}
                                    activeOpacity={0.7}
                                >
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Address</Text>
                            <TouchableOpacity
                                style={styles.addressInputContainer}
                                onPress={handleAddressSelection}
                                activeOpacity={0.7}
                            >
                                <Text style={[
                                    styles.addressText,
                                    !address && styles.addressPlaceholder
                                ]}>
                                    {(address?.split('/')[0].trim()) || 'Select your address'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.termsContainer}>
                            <Text style={styles.termsText}>
                                By signing up, you agree to our{' '}
                                <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                                <Text style={styles.termsLink}>Privacy Policy</Text>
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.signupButton, loading && styles.buttonDisabled]}
                            onPress={handleRegister}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.signupButtonText}>
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.loginContainer}>
                            <Text style={styles.loginText}>Already have an account? </Text>
                            <TouchableOpacity onPress={handleBackToLogin} activeOpacity={0.7}>
                                <Text style={styles.loginLink}>Sign In</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Move modals outside ScrollView to avoid touch conflicts */}
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
                            setShowOtpModal(false);
                            setShowConfirmationModal(true);
                        } else {
                            Toast.show({
                                type: 'error',
                                text1: 'Verification Failed',
                                text2: 'OTP Verification Error',
                                position: 'top',
                            });
                        }
                    } catch (err) {
                        Toast.show({
                            type: 'error',
                            text1: 'Verification Failed',
                            text2: 'OTP Verification Error',
                            position: 'top',
                        });
                    }
                }}
                onResend={() => {
                    console.log('Resend OTP');
                }}
            />

            <ConfirmationModal
                visible={showConfirmationModal}
                onNext={() => {
                    navigation.replace("Login");
                }}
            />
        </SafeAreaView>
    );
};

export default SignupScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: 40, // Increased bottom padding
    },
    header: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 20,
        borderRadius: 60,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
    },
    formContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    inputGroup: {
        marginBottom: 20, // Increased spacing
    },
    label: {
        fontSize: 13,
        fontWeight: '500',
        color: '#555',
        marginBottom: 8, // Increased spacing
    },
    input: {
        borderWidth: 1,
        borderColor: '#e1e5e9',
        borderRadius: 8,
        padding: 12,
        fontSize: 15,
        backgroundColor: '#fafafa',
        color: '#333',
        minHeight: 44,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e1e5e9',
        borderRadius: 8,
        backgroundColor: '#fafafa',
        paddingRight: 12,
        minHeight: 44,
    },
    passwordInput: {
        flex: 1,
        padding: 12,
        fontSize: 15,
        color: '#333',
    },
    eyeButton: {
        padding: 8, // Increased touch area
        minWidth: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    eyeIcon: {
        fontSize: 16,
    },
    addressInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#e1e5e9',
        borderRadius: 8,
        backgroundColor: '#fafafa',
        padding: 12,
        minHeight: 44,
    },
    addressText: {
        fontSize: 15,
        color: '#333',
        flex: 1,
    },
    addressPlaceholder: {
        color: '#999',
    },
    locationIcon: {
        fontSize: 16,
        marginLeft: 8,
    },
    termsContainer: {
        marginBottom: 24, // Increased spacing
    },
    termsText: {
        fontSize: 12,
        color: '#666',
        lineHeight: 18,
        textAlign: 'center',
    },
    termsLink: {
        color: appColors.darkerBg,
        fontWeight: '600',
    },
    signupButton: {
        backgroundColor: appColors.Primary_Button,
        borderRadius: 8,
        padding: 16, // Increased padding
        alignItems: 'center',
        marginBottom: 20, // Increased spacing
        minHeight: 48,
        justifyContent: 'center',
        shadowColor: appColors.darkerBg,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
        shadowOpacity: 0,
    },
    signupButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 10, // Extra padding at bottom
    },
    loginText: {
        fontSize: 14,
        color: '#666',
    },
    loginLink: {
        fontSize: 14,
        color: appColors.darkerBg,
        fontWeight: '600',
    },
});