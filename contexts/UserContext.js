// context/UserContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [LoggedInUser, setLoggedInUser] = useState(null);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const userData = await AsyncStorage.getItem('user');
                if (userData) {
                    setLoggedInUser(JSON.parse(userData));
                }
            } catch (e) {
                console.log("Error loading user:", e);
            }
        };
        loadUser();
    }, []);

    return (
        <UserContext.Provider value={{ LoggedInUser, setLoggedInUser }}>
            {children}
        </UserContext.Provider>
    );
};
