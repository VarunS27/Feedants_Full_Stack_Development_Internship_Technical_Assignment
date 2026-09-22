import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useLanguage } from '../../providers/LanguageProvider';
import { presentCta } from '../../utils/ctaPresenter';

/**
 * The single primary action. Its label, enabled state and meaning all come from the
 * server's `viewer.cta`, so a user whose spot just got taken sees the correct button
 * on the next refresh instead of a request that fails after they tap.
 */
export const PrimaryActionBar = ({ competition, isBusy, onPress }) => {
  const { t, language } = useLanguage();
  const cta = presentCta(competition, t, language);
  const isPressable = cta.enabled && !isBusy && cta.intent !== 'none';

  return (
    <View className="px-4 pb-2 pt-2">
      <Pressable
        onPress={() => isPressable && onPress(cta.intent)}
        disabled={!isPressable}
        accessibilityRole="button"
        accessibilityState={{ disabled: !isPressable, busy: isBusy }}
        accessibilityLabel={cta.hint ? `${cta.label}, ${cta.hint}` : cta.label}
        className={`items-center justify-center rounded-xl py-3.5 ${
          cta.enabled ? 'bg-primary active:opacity-85' : 'bg-ink-line'
        }`}
      >
        {isBusy ? (
          <ActivityIndicator color={cta.enabled ? '#FFFFFF' : '#6B7280'} />
        ) : (
          <>
            <Text
              className={`text-base font-bold ${cta.enabled ? 'text-white' : 'text-ink-muted'}`}
            >
              {cta.label}
            </Text>
            {cta.hint && (
              <Text
                className={`mt-0.5 text-xs ${cta.enabled ? 'text-white/80' : 'text-ink-soft'}`}
              >
                {cta.hint}
              </Text>
            )}
          </>
        )}
      </Pressable>
    </View>
  );
};
