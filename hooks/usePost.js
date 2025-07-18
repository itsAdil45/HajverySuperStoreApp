import { useState } from 'react';
import axios from 'axios';
import useAxiosAuth from './useAxiosAuth';

const baseUrl = "http://192.168.49.215:5000";

const usePost = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [errorCode, setErrorCode] = useState(null);
    const axiosAuth = useAxiosAuth();

    const post = async (endpoint, data, useAuth = false) => {
        setLoading(true);
        setError(null);
        try {
            const instance = useAuth ? axiosAuth : axios;
            const response = await instance.post(baseUrl + endpoint, data);
            return response.data;
        } catch (err) {
            console.log(err);
            setError(err.response?.data?.message || err.message);
            setErrorCode(err?.response?.status);
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { post, loading, error, errorCode };
};

export default usePost;
