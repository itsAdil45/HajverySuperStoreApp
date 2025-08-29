import { useState, useEffect, useCallback } from 'react';
import useAxiosAuth from './useAxiosAuth';

const useGet = (endpoint, runOnMount = true) => {
    const axiosAuth = useAxiosAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(runOnMount);
    const [error, setError] = useState(null);
    const [forceRefreshKey, setForceRefreshKey] = useState(0);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            console.log(`Fetching: ${endpoint} (refresh: ${forceRefreshKey})`);

            // Get fresh axios instance
            const res = await axiosAuth.get(endpoint);
            setData(res.data);
        } catch (err) {
            console.error(`Error fetching ${endpoint}:`, err.message);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [endpoint, forceRefreshKey]); // Remove axiosAuth dependency

    const refetch = useCallback(() => {
        setForceRefreshKey(prev => prev + 1);
    }, []);

    useEffect(() => {
        if (runOnMount || forceRefreshKey > 0) {
            fetchData();
        }
    }, [fetchData, runOnMount]);

    return { data, loading, error, refetch };
};
export default useGet;