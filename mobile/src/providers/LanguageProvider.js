import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from '../i18n/translations';
import { STORAGE_KEYS } from '../config';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState('en');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.language)
      .then((saved) => {
        if (saved && translations[saved]) setLanguageState(saved);
      })
      .finally(() => setIsReady(true));
  }, []);

  const setLanguage = useCallback((next) => {
    setLanguageState(next);
    AsyncStorage.setItem(STORAGE_KEYS.language, next).catch(() => {});
  }, []);

  const value = useMemo(
    () => ({ language, setLanguage, t: translations[language], isReady }),
    [language, setLanguage, isReady]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
