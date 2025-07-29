import { useState } from 'react';
import axios from 'axios';
import useAxiosAuth from './useAxiosAuth';

const baseUrl = 'https://hajverystorebackend.onrender.com';

const useDelete = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [errorCode, setErrorCode] = useState(null);
    const axiosAuth = useAxiosAuth();

    const deleteRequest = async (endpoint, useAuth = false) => {
        setLoading(true);
        setError(null);
        setErrorCode(null);

        try {
            console.log('Using auth:', useAuth);

            let response;
            if (useAuth) {
                const cleanEndpoint = endpoint.startsWith('/api') ? endpoint.substring(4) : endpoint;
                console.log('Auth delete request to:', cleanEndpoint);
                response = await axiosAuth.delete(cleanEndpoint);
            } else {
                // For non-authenticated requests, use regular axios
                console.log('Regular delete request to:', baseUrl + endpoint);
                response = await axios.delete(baseUrl + endpoint);
            }

            return response.data;
        } catch (err) {
            console.error('Delete request error:', err);
            console.error('Error response:', err.response?.data);

            const errorMessage = err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                'Delete request failed';

            setError(errorMessage);
            setErrorCode(err?.response?.status);
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { deleteRequest, loading, error, errorCode };
};

export default useDelete;