import { useState, useCallback } from 'react';
import api from '../services/api.service';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const post = useCallback(async <T>(url: string, data: any): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(url, data);
      return res.data;
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Erreur';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback(async <T>(url: string): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(url);
      return res.data;
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Erreur';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const del = useCallback(async <T>(url: string): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.delete(url);
      return res.data;
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Erreur';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, post, get, del };
};
