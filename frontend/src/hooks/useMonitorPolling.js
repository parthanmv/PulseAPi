import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';

export function useMonitorList() {
  const [monitors, setMonitors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const response = await client.get('/api/monitors');
      setMonitors(response.data);
    } catch (err) {
      console.error('Failed to load monitors:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 10000);
    return () => clearInterval(interval);
  }, [fetch]);

  return { monitors, loading, refetch: fetch };
}


export function useMonitorDetail(id) {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const [statsRes, historyRes] = await Promise.all([
        client.get(`/api/monitors/${id}`),
        client.get(`/api/monitors/${id}/history`),
      ]);
      setData(statsRes.data);
      setHistory(historyRes.data);
    } catch (err) {
      console.error('Failed to fetch monitor details:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 10000);
    return () => clearInterval(interval);
  }, [fetch]);

  return { data, history, loading, refetch: fetch };
}
