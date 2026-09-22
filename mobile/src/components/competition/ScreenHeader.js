import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LANGUAGES } from '../../i18n/translations';
import { useLanguage } from '../../providers/LanguageProvider';

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <View className="flex-row rounded-full bg-surface-chip p-0.5">
      {LANGUAGES.map(({ code, label }) => {
        const isActive = language === code;
        return (
          <Pressable
            key={code}
            onPress={() => setLanguage(code)}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            className={`rounded-full px-4 py-1.5 ${isActive ? 'bg-primary' : ''}`}
          >
            <Text
              className={`text-xs font-bold ${isActive ? 'text-white' : 'text-ink-muted'}`}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export const ScreenHeader = ({ onBack }) => {
  const { t } = useLanguage();

  return (
    <View className="flex-row items-center justify-between px-4 py-3">
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel={t.goBack}
        hitSlop={8}
        className="flex-row items-center active:opacity-60"
      >
        <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
        <Text className="ml-2.5 text-lg font-semibold text-ink">{t.goBack}</Text>
      </Pressable>

      <LanguageToggle />
    </View>
  );
};
