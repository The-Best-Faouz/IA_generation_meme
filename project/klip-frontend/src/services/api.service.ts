import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/api';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('@klip/token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem('@klip/refreshToken');
        if (!refreshToken) throw new Error('No refresh token');
        const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const newToken = res.data.token;
        await AsyncStorage.setItem('@klip/token', newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch {
        await AsyncStorage.multiRemove(['@klip/token', '@klip/refreshToken']);
        return Promise.reject(error);
      }
    }

    const shouldRetry =
      !originalRequest._retryCount &&
      (error.code === 'ECONNABORTED' ||
       error.code === 'ERR_NETWORK' ||
       error.response?.status === 503 ||
       error.response?.status === 504);

    if (shouldRetry) {
      originalRequest._retryCount = 1;
    }

    if (originalRequest._retryCount && originalRequest._retryCount <= MAX_RETRIES) {
      const delay = RETRY_DELAY * originalRequest._retryCount;
      originalRequest._retryCount += 1;
      await wait(delay);
      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default api;
