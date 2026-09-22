import React, { useState } from 'react';
import { Pressable, Share, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLanguage } from '../../providers/LanguageProvider';

const COPIED_FEEDBACK_MS = 1800;

export const ReferAndEarn = ({ referral, competitionTitle }) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  if (!referral?.isEnabled || !referral.link) return null;

  const copyLink = async () => {
    await Clipboard.setStringAsync(referral.link);
    setCopied(true);
    setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
  };

  const share = () =>
    Share.share({
      message: `${competitionTitle} — ${referral.link}`,
    }).catch(() => {});

  return (
    <View className="mt-3 rounded-card bg-accent-green px-3.5 py-3">
      <View className="flex-row items-center">
        <MaterialCommunityIcons name="bullhorn-outline" size={22} color="#1F7A4D" />
        <Text className="ml-2 flex-1 text-sm font-bold text-ink">{t.referAndEarn}</Text>
      </View>

      <View className="mt-2.5 flex-row items-center">
        <View className="flex-1 flex-row items-center rounded-lg bg-surface px-2.5 py-2">
          <Text className="flex-1 text-xs text-ink-muted" numberOfLines={1}>
            {referral.link}
          </Text>
          <Pressable onPress={copyLink} accessibilityRole="button" hitSlop={6}>
            <Text className="ml-2 text-xs font-bold text-primary">
              {copied ? t.copied : t.copyLink}
            </Text>
          </Pressable>
        </View>

        <Pressable
          onPress={share}
          accessibilityRole="button"
          className="ml-2.5 rounded-lg bg-primary px-5 py-2.5 active:opacity-80"
        >
          <Text className="text-sm font-bold text-white">{t.referNow}</Text>
        </Pressable>
      </View>

      {referral.bonusPerSignup > 0 && (
        <Text className="mt-2 text-right text-xs text-ink-muted">
          {t.referralBonus(referral.bonusPerSignup)}
        </Text>
      )}
    </View>
  );
};
