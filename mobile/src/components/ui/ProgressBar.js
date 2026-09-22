import React from 'react';
import { View } from 'react-native';

/** Fill is clamped so a stale or over-counted value can never overflow the track. */
export const ProgressBar = ({ percent, className = '' }) => {
  const clamped = Math.min(Math.max(Number(percent) || 0, 0), 100);
  return (
    <View className={`h-1.5 w-full rounded-full bg-ink-line overflow-hidden ${className}`}>
      <View className="h-full rounded-full bg-primary" style={{ width: `${clamped}%` }} />
    </View>
  );
};
