import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api.service';

export interface User {
  id: string;
  email: string;
  country?: string;
  language?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('@klip/token');
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await api.get('/user/profile');
      setUser(res.data.user);
    } catch {
      await AsyncStorage.multiRemove(['@klip/token', '@klip/refreshToken']);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    await AsyncStorage.setItem('@klip/token', res.data.token);
    await AsyncStorage.setItem('@klip/refreshToken', res.data.refreshToken);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (email: string, password: string, country: string, language: string) => {
    const res = await api.post('/auth/register', { email, password, country, language });
    await AsyncStorage.setItem('@klip/token', res.data.token);
    await AsyncStorage.setItem('@klip/refreshToken', res.data.refreshToken);
    setUser(res.data.user);
    return res.data;
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['@klip/token', '@klip/refreshToken']);
    setUser(null);
  };

  return { user, loading, login, register, logout };
};
