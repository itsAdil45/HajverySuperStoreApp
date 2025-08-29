import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMemo } from 'react';

const useAxiosAuth = () => {
    // Use useMemo to ensure the same instance is returned on re-renders
    const instance = useMemo(() => {
        const axiosInstance = axios.create({
            baseURL: 'https://hajverystorebackend.onrender.com/api',
            timeout: 10000, // 10 second timeout
        });

        axiosInstance.interceptors.request.use(
            async (config) => {
                try {
                    const token = await AsyncStorage.getItem('token');
                    // console.log('🔗 Full URL:', `${config.baseURL}${config.url}`);

                    if (token) {
                        config.headers.Authorization = `${token}`;
                    } else {
                        console.warn('No authentication token found');
                    }
                } catch (error) {
                    console.error('Error retrieving token from AsyncStorage:', error);
                }
                return config;
            },
            (error) => {
                console.error('Request interceptor error:', error);
                return Promise.reject(error);
            }
        );

        return axiosInstance;
    }, []); // Empty dependency array - create once and reuse

    return instance;
};

export default useAxiosAuth;