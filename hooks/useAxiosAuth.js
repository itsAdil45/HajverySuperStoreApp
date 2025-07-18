// hooks/useAxiosAuth.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useAxiosAuth = () => {
    const instance = axios.create({
        baseURL: 'http://192.168.49.215:5000/api',
    });

    instance.interceptors.request.use(
        async (config) => {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    return instance;
};

export default useAxiosAuth;
