import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api.service';

export interface User {
  id: string;
  email: string;
  country?: string;
  language?: string;
}

let listeners: Function[] = [];
let globalUser: User | null = null;
let globalLoading: boolean = true;

const notify = () => listeners.forEach(l => l());

export const useAuth = () => {
  const [user, setUserState] = useState<User | null>(globalUser);
  const [loading, setLoadingState] = useState<boolean>(globalLoading);

  useEffect(() => {
    const listener = () => {
      setUserState(globalUser);
      setLoadingState(globalLoading);
    };
    listeners.push(listener);
    return () => { listeners = listeners.filter(l => l !== listener); };
  }, []);

  const setUser = (u: User | null) => { globalUser = u; notify(); };
  const setLoading = (l: boolean) => { globalLoading = l; notify(); };

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
    // Only load if it's the first time
    if (globalLoading) {
      loadUser();
    }
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
