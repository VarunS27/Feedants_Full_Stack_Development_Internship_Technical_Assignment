import { apiClient } from './client';

export const login = (email, password) => apiClient.post('/auth/login', { email, password });

export const signup = (payload) => apiClient.post('/auth/signup', payload);

export const fetchMe = () => apiClient.get('/auth/me');

export const updateLanguagePreference = (language) =>
  apiClient.patch('/auth/me/language', { language });
