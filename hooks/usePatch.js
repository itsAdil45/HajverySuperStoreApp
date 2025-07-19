import { useState } from 'react';
import useAxiosAuth from './useAxiosAuth';

const usePatch = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [errorCode, setErrorCode] = useState(null);
    const axiosAuth = useAxiosAuth();

    const patch = async (endpoint, data) => {
        setLoading(true);
        setError(null);
        setErrorCode(null);

        try {
            // Remove '/api' from endpoint since it's already in the base URL
            const cleanEndpoint = endpoint.startsWith('/api') ? endpoint.substring(4) : endpoint;
            console.log('Patch request to:', cleanEndpoint);

            const response = await axiosAuth.patch(cleanEndpoint, data);
            return response.data;
        } catch (err) {
            console.error('Patch request error:', err);
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

    return { patch, loading, error, errorCode };
};

export default usePatch;