import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authApi from '../api/auth';
import { STORAGE_KEYS } from '../config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isRestoring, setIsRestoring] = useState(true);

  // Restore the session on launch; a stale token is discarded rather than surfaced.
  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.token);
      if (token) {
        try {
          setUser(await authApi.fetchMe());
        } catch {
          await AsyncStorage.removeItem(STORAGE_KEYS.token);
        }
      }
      setIsRestoring(false);
    })();
  }, []);

  const signIn = useCallback(async (email, password) => {
    const result = await authApi.login(email, password);
    await AsyncStorage.setItem(STORAGE_KEYS.token, result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.token);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), isRestoring, signIn, signOut }),
    [user, isRestoring, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
