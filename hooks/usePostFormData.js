import { useState } from 'react';
import axios from 'axios';
import useAxiosAuth from './useAxiosAuth';

const baseUrl = 'http://192.168.49.215:5000';

const usePostFormData = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [errorCode, setErrorCode] = useState(null);
    const axiosAuth = useAxiosAuth();

    const postFormData = async (endpoint, data, useAuth = false) => {
        setLoading(true);
        setError(null);
        setErrorCode(null);

        try {
            console.log('Posting FormData with auth:', useAuth);

            // Create FormData object
            const formData = new FormData();

            // Append all data to FormData
            Object.keys(data).forEach(key => {
                if (data[key] !== null && data[key] !== undefined) {
                    if (key === 'receipt' && data[key]) {
                        // Handle file upload
                        formData.append('receipt', {
                            uri: data[key],
                            type: 'image/jpeg', // or detect from file extension
                            name: 'receipt.jpg'
                        });
                    } else if (typeof data[key] === 'object') {
                        // Handle objects like charges
                        formData.append(key, JSON.stringify(data[key]));
                    } else {
                        // Handle regular fields
                        formData.append(key, data[key]);
                    }
                }
            });

            let response;
            if (useAuth) {
                const cleanEndpoint = endpoint.startsWith('/api') ? endpoint.substring(4) : endpoint;

                // Use axiosAuth but with multipart headers
                response = await axiosAuth.post(cleanEndpoint, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            } else {
                console.log('Regular FormData request to:', baseUrl + endpoint);
                response = await axios.post(baseUrl + endpoint, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            }

            return response.data;
        } catch (err) {
            console.error('FormData post request error:', err);
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

    return { postFormData, loading, error, errorCode };
};

export default usePostFormData;