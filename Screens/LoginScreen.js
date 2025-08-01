import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useAuth } from '../contexts/AuthContext';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [hidePassword, setHidePassword] = useState(true);
    const { login, loading, error, errorCode } = useAuth();

    const handleLogin = async () => {
        const success = await login(email, password);
        if (!success && !loading) {
            if (errorCode == 403) {
                navigation.navigate('UserAuth', {
                    email,
                    type: "email"
                })
            }
            console.log(errorCode);
            Alert.alert('Login Failed', error || 'Invalid email or password');
        }
    };

    const handleForgetPassword = () => {
        navigation.navigate('UserAuth', {
            type: "password"
        })
    };

    return (

        <SafeAreaView style={styles.container}>
            <Image source={require('../assets/login.png')} style={styles.logo} />
            <Text style={styles.title}>Login</Text>
            <Text style={styles.subtitle}>Enter your email and password</Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={setEmail}
            />

            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.inputPassword}
                    placeholder="Password"
                    value={password}
                    secureTextEntry={hidePassword}
                    onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setHidePassword(!hidePassword)}>
                    {hidePassword ? <Feather name='eye-off' size={20} color="#777" /> : <Feather name='eye' size={20} color="#777" />}
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotButton} onPress={() => handleForgetPassword()}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}  >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.loginButtonText}>Log In</Text>
                )}
            </TouchableOpacity>

            <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                    <Text style={styles.signupLink}>Signup</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default LoginScreen;


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
        marginBottom: 8,
    },
    inputPassword: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 8,
    },
    forgotButton: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotText: {
        color: '#666',
        fontSize: 13,
    },
    loginButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 32,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    signupText: {
        fontSize: 14,
        color: '#444',
    },
    signupLink: {
        fontSize: 14,
        color: '#4CAF50',
        fontWeight: '500',
    },
});