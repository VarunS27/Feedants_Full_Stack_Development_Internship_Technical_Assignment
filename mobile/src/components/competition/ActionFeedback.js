import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Inline feedback above the CTA. Preferred over Alert: business-rule rejections
 * ("spots just filled up") are part of the flow, and an inline banner keeps the
 * competition state visible while explaining what happened.
 */
export const ActionFeedback = ({ feedback, onDismiss }) => {
  if (!feedback) return null;

  const isError = feedback.type === 'error';

  return (
    <View
      className={`mx-4 mb-1 flex-row items-center rounded-xl px-3 py-2.5 ${
        isError ? 'bg-red-50' : 'bg-accent-green'
      }`}
      accessibilityLiveRegion="polite"
    >
      <Ionicons
        name={isError ? 'alert-circle-outline' : 'checkmark-circle-outline'}
        size={17}
        color={isError ? '#B91C1C' : '#1F7A4D'}
      />
      <Text
        className={`ml-2 flex-1 text-xs ${isError ? 'text-red-700' : 'text-accent-greenDark'}`}
      >
        {feedback.message}
      </Text>
      <Pressable onPress={onDismiss} hitSlop={8} accessibilityRole="button">
        <Ionicons name="close" size={15} color={isError ? '#B91C1C' : '#1F7A4D'} />
      </Pressable>
    </View>
  );
};
