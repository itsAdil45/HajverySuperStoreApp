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
            const storedToken = await AsyncStorage.getItem('token');
            const storedUser = await AsyncStorage.getItem('user');
            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
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

            // Save to AsyncStorage
            await AsyncStorage.setItem('token', response.token);
            await AsyncStorage.setItem('user', JSON.stringify(response.user));

            return true;
        }
        return false;
    };

    const logout = async () => {
        setUser(null);
        setToken(null);
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading, error, errorCode }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
