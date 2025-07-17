import { useState } from 'react';
import axios from 'axios';
const baseUrl = "http://192.168.49.215:5000";
const usePost = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [errorCode, setErrorCode] = useState(null);
    const post = async (endpoint, data) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(baseUrl + endpoint, data);
            return response.data;
        } catch (err) {
            console.log(err)
            setError(err.response?.data?.message || err.message);
            setErrorCode(err?.response?.data?.status)
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { post, loading, error, errorCode };
};

export default usePost;
