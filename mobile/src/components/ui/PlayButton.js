import React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SIZES = {
  sm: { box: 26, icon: 13 },
  md: { box: 38, icon: 18 },
  lg: { box: 44, icon: 20 },
};

/**
 * `decorative` renders the glyph without its own press target, for use inside an
 * already-pressable parent — nesting touchables breaks web semantics and swallows
 * taps on native.
 */
export const PlayButton = ({
  size = 'md',
  onPress,
  variant = 'solid',
  accessibilityLabel,
  decorative = false,
}) => {
  const { box, icon } = SIZES[size] ?? SIZES.md;
  const isSolid = variant === 'solid';

  const glyph = (
    <View
      className={`items-center justify-center rounded-full ${
        isSolid ? 'bg-primary' : 'bg-primary-soft'
      }`}
      style={{ width: box, height: box }}
    >
      <Ionicons
        name="play"
        size={icon}
        color={isSolid ? '#FFFFFF' : '#0E6E6E'}
        style={{ marginLeft: 2 }}
      />
    </View>
  );

  if (decorative) return glyph;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      className="active:opacity-70"
    >
      {glyph}
    </Pressable>
  );
};
