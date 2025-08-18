import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useAxiosAuth = () => {
    const instance = axios.create({
        baseURL: 'https://hajverystorebackend.onrender.com/api',
        timeout: 10000, // 10 second timeout
    });

    instance.interceptors.request.use(
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

    return instance;
};

export default useAxiosAuth;
