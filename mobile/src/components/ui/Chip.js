import React from 'react';
import { Text, View } from 'react-native';

export const Chip = ({ label, className = '', textClassName = '' }) => (
  <View className={`bg-surface-chip rounded-full px-3 py-1.5 ${className}`}>
    <Text className={`text-xs font-semibold text-ink ${textClassName}`}>{label}</Text>
  </View>
);
