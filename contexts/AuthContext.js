import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import usePost from '../hooks/usePost';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const { post, loading, error, errorCode } = usePost();

    // Load token/user from AsyncStorage on mount
    useEffect(() => {
        const loadAuthData = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('token');
                const storedUser = await AsyncStorage.getItem('user');
                if (storedToken && storedUser) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                }
            } catch (e) {
                console.log("Error loading auth data:", e);
            }
        };
        loadAuthData();
    }, []);

    const login = async (email, password) => {
        const response = await post('/api/auth/login', {
            email,
            password,
        });

        if (response && response.status === 'success') {
            setToken(response.token);
            setUser(response.user);
            console.log(response.user);

            // Save to AsyncStorage
            try {
                await AsyncStorage.setItem('token', response.token);
                await AsyncStorage.setItem('user', JSON.stringify(response.user));
            } catch (e) {
                console.log("Error saving auth data:", e);
            }

            return true;
        }
        return false;
    };

    const logout = async () => {
        setUser(null);
        setToken(null);
        try {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
        } catch (e) {
            console.log("Error removing auth data:", e);
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, token, login, logout, loading, error, errorCode }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);