import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Image
} from 'react-native';
import VerifyPromptModal from '../Modals/VerifyPromptModal';
import OtpModal from '../Modals/OtpModal';
import ConfirmationModal from '../Modals/ConfirmationModal';
const SignupScreen = ({ navigation }) => {
    const [step, setStep] = useState(1);

    // Step 1 Fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [showVerifyPrompt, setShowVerifyPrompt] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);

    // Step 2 Fields
    const [password, setPassword] = useState('');
    const [address, setAddress] = useState('');
    const [hidePassword, setHidePassword] = useState(true);

    const handleNext = () => {
        // Optional: validate step 1 fields
        if (name && email && phone) {
            setStep(2);
        }
    };

    const handleRegister = () => {
        // Call your register API or logic here
        const userData = { name, email, phone, password, address };
        setShowVerifyPrompt(true);
        console.log('Registering User:', userData);
    };

    const handleBackNavigation = () => {
        if (step === 1) {
            // Go back to login, replace current screen
            navigation.replace('Login');
        } else {
            // Go back to step 1
            setStep(1);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.centered}>
                <Image
                    source={require('../assets/login.png')}
                    style={styles.logo}
                />
                <Text style={styles.title}>Sign Up</Text>
                <Text style={styles.subtitle}>Enter your credentials to continue</Text>

                {step === 1 ? (
                    <>
                        <TextInput
                            style={styles.input}
                            placeholder="Username"
                            value={name}
                            onChangeText={setName}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Phone"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                        />

                        <TouchableOpacity style={styles.button} onPress={handleNext}>
                            <Text style={styles.buttonText}>Next</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.inputPassword}
                                placeholder="Password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={hidePassword}
                            />
                            <TouchableOpacity onPress={() => setHidePassword(!hidePassword)}>
                                <Text>{hidePassword ? '👁️' : '🚫'}</Text>
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={styles.input}
                            placeholder="Address"
                            value={address}
                            onChangeText={setAddress}
                        />

                        <Text style={styles.terms}>
                            By continuing you agree to our{' '}
                            <Text style={styles.link}>Terms of Service</Text> and{' '}
                            <Text style={styles.link}>Privacy Policy</Text>.
                        </Text>

                        <TouchableOpacity style={styles.button} onPress={handleRegister}>
                            <Text style={styles.buttonText}>Sign Up</Text>
                        </TouchableOpacity>
                    </>
                )}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        {step === 1 ? "Already have an account?" : "Back to previous step?"}
                    </Text>
                    <TouchableOpacity onPress={handleBackNavigation}>
                        <Text style={styles.footerLink}> {step === 1 ? 'Login' : 'Back'}</Text>
                    </TouchableOpacity>
                </View>

                <VerifyPromptModal
                    visible={showVerifyPrompt}
                    phone={phone}
                    onCancel={() => setShowVerifyPrompt(false)}
                    onNext={() => {
                        setShowVerifyPrompt(false);
                        setShowOtpModal(true);
                    }}
                />

                <OtpModal
                    visible={showOtpModal}
                    phone={phone}
                    onVerify={(otpCode) => {
                        console.log('Verifying with:', otpCode);
                        setShowOtpModal(false);
                        setShowConfirmationModal(true)
                    }}
                    onResend={() => {
                        console.log('Resend OTP');
                    }}
                />
                <ConfirmationModal
                    visible={showConfirmationModal}
                    onNext={() => {
                        navigation.replace("Login")
                    }}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

export default SignupScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: 'white',
    },
    centered: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: 40,
    },
    inner: {
        paddingVertical: 40,
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
    terms: {
        fontSize: 12,
        color: '#777',
        marginBottom: 24,
    },
    link: {
        color: '#4CAF50',
        fontWeight: '500',
    },
    button: {
        backgroundColor: '#4CAF50',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 32,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    footerText: {
        fontSize: 14,
        color: '#444',
    },
    footerLink: {
        fontSize: 14,
        color: '#4CAF50',
        fontWeight: '500',
    },
    logo: {
        width: 140,
        height: 140,
        alignSelf: 'center',
        marginBottom: 32,
    },
});