import { useState, useEffect } from 'react';
import useAxiosAuth from './useAxiosAuth';

const useGet = (endpoint, runOnMount = true) => {
    const axiosAuth = useAxiosAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(runOnMount);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await axiosAuth.get(endpoint);
            setData(res.data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (runOnMount) {
            fetchData();
        }
    }, [endpoint]); // this will re-run if endpoint changes

    return { data, loading, error, refetch: fetchData };
};


export default useGet;
