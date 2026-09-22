import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { useLanguage } from '../../providers/LanguageProvider';

export const UserVoices = ({ onPress }) => {
  const { t } = useLanguage();

  return (
    <Pressable onPress={onPress} accessibilityRole="button" className="active:opacity-80">
      <Card className="mt-3 flex-row items-center px-3.5 py-3">
        <Ionicons name="chatbubble-ellipses-outline" size={20} color="#0E6E6E" />
        <View className="ml-2.5 flex-1">
          <Text className="text-sm font-bold text-ink">{t.hearFromUsers}</Text>
          <Text className="mt-0.5 text-xs text-ink-muted">{t.hearFromUsersSubtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
      </Card>
    </Pressable>
  );
};

/** Placeholder slot the design reserves for an ad unit. */
export const AdSlot = () => {
  const { t } = useLanguage();

  return (
    <View className="mt-3 flex-row items-center justify-center rounded-card border border-dashed border-ink-line bg-surface py-4">
      <Ionicons name="megaphone-outline" size={15} color="#9CA3AF" />
      <Text className="ml-2 text-xs text-ink-soft">{t.adHere}</Text>
    </View>
  );
};
