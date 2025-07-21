import { useState } from 'react';
import axios from 'axios';
import useAxiosAuth from './useAxiosAuth';

const baseUrl = 'http://192.168.49.215:5000';

const usePost = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [errorCode, setErrorCode] = useState(null);
    const axiosAuth = useAxiosAuth();

    const post = async (endpoint, data, useAuth = false) => {
        setLoading(true);
        setError(null);
        setErrorCode(null);

        try {
            console.log('Using auth:', useAuth);

            let response;
            if (useAuth) {

                const cleanEndpoint = endpoint.startsWith('/api') ? endpoint.substring(4) : endpoint;
                response = await axiosAuth.post(cleanEndpoint, data);
            } else {
                console.log('Regular request to:', baseUrl + endpoint);
                response = await axios.post(baseUrl + endpoint, data);
            }

            return response.data;
        } catch (err) {
            console.error('Post request error:', err);
            console.error('Error response:', err.response?.data);

            const errorMessage = err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                'Request failed';

            setError(errorMessage);
            setErrorCode(err?.response?.status);
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { post, loading, error, errorCode };
};

export default usePost;