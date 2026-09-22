import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, REQUEST_TIMEOUT_MS, STORAGE_KEYS } from '../config';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(STORAGE_KEYS.token);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Normalises every failure into the same shape as the server's error envelope, so
 * screens can switch on `code` without caring whether the request failed at the
 * network layer or was rejected by a business rule.
 */
export class ApiError extends Error {
  constructor({ code, message, details, status }) {
    super(message);
    this.code = code;
    this.details = details;
    this.status = status;
  }
}

apiClient.interceptors.response.use(
  (response) => response.data?.data ?? response.data,
  (error) => {
    if (error.response) {
      const payload = error.response.data?.error ?? {};
      return Promise.reject(
        new ApiError({
          code: payload.code || 'UNKNOWN_ERROR',
          message: payload.message || 'Something went wrong.',
          details: payload.details,
          status: error.response.status,
        })
      );
    }
    return Promise.reject(
      new ApiError({
        code: error.code === 'ECONNABORTED' ? 'TIMEOUT' : 'NETWORK_ERROR',
        message: 'Unable to reach the server. Check your connection and try again.',
        status: 0,
      })
    );
  }
);
