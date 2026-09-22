import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../providers/LanguageProvider';

const Shimmer = ({ className = '' }) => (
  <View className={`rounded-lg bg-ink-line/70 ${className}`} />
);

/** Mirrors the real layout so the screen does not jump when data lands. */
export const DetailsSkeleton = () => (
  <View className="px-4 pt-2">
    <View className="rounded-card border border-ink-line bg-surface p-4">
      <Shimmer className="h-6 w-2/3" />
      <View className="mt-3 flex-row">
        <Shimmer className="mr-2 h-6 w-16" />
        <Shimmer className="h-6 w-24" />
      </View>
      <View className="mt-4 flex-row justify-between">
        <Shimmer className="h-10 w-24" />
        <Shimmer className="h-10 w-28" />
      </View>
    </View>

    <View className="mt-3 flex-row items-center rounded-card border border-ink-line bg-surface p-4">
      <Shimmer className="h-14 w-14 rounded-full" />
      <View className="ml-3 flex-1">
        <Shimmer className="h-4 w-1/3" />
        <Shimmer className="mt-2 h-4 w-1/2" />
      </View>
    </View>

    <Shimmer className="mt-3 h-12 w-full" />
    <Shimmer className="mt-3 h-40 w-full" />
  </View>
);

export const ErrorState = ({ error, onRetry }) => {
  const { t } = useLanguage();

  return (
    <View className="flex-1 items-center justify-center px-8">
      <Ionicons name="cloud-offline-outline" size={44} color="#9CA3AF" />
      <Text className="mt-3 text-base font-bold text-ink">{t.somethingWentWrong}</Text>
      <Text className="mt-1.5 text-center text-sm text-ink-muted">
        {error?.message ?? ''}
      </Text>
      <Pressable
        onPress={onRetry}
        accessibilityRole="button"
        className="mt-5 rounded-xl bg-primary px-8 py-3 active:opacity-85"
      >
        <Text className="text-sm font-bold text-white">{t.retry}</Text>
      </Pressable>
    </View>
  );
};
