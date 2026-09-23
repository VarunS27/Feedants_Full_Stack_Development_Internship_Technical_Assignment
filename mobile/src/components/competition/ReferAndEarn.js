import React, { useState } from 'react';
import { Pressable, Share, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLanguage } from '../../providers/LanguageProvider';

const COPIED_FEEDBACK_MS = 1800;

/**
 * Colours and proportions sampled directly from the design asset rather than guessed:
 * the mint card, the teal megaphone, and the deeper teal of the button and link text are
 * specific to this block and deliberately not the app's primary palette.
 */
const COLOR = {
  card: '#E8F8F0',
  megaphone: '#33BB97',
  title: '#0A0A0A',
  url: '#137C81',
  copyLink: '#035B6D',
  button: '#007080',
  bonus: '#0A6F7D',
  bonusAmount: '#006169',
  divider: '#D6E9E9',
  inputBorder: '#E2F0EC',
};

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
    Share.share({ message: `${competitionTitle} — ${referral.link}` }).catch(() => {});

  return (
    <View
      className="mt-3 flex-row items-center rounded-card px-3 py-3"
      style={{ backgroundColor: COLOR.card }}
    >
      <MaterialCommunityIcons name="bullhorn-outline" size={26} color={COLOR.megaphone} />

      <View className="ml-1 flex-1">
        <Text className="text-[11px] font-bold" style={{ color: COLOR.title }} numberOfLines={1}>
          {t.referAndEarn}
        </Text>

        <View
          className="mt-1.5 flex-row items-center rounded-lg border bg-white"
          style={{ borderColor: COLOR.inputBorder }}
        >
          <Text
            className="flex-1 px-2 py-1.5 text-[10px]"
            style={{ color: COLOR.url }}
            numberOfLines={1}
          >
            {referral.link}
          </Text>

          <View className="h-4 w-px" style={{ backgroundColor: COLOR.divider }} />

          <Pressable
            onPress={copyLink}
            accessibilityRole="button"
            hitSlop={6}
            className="px-2 py-1.5 active:opacity-60"
          >
            <Text className="text-[10px] font-bold" style={{ color: COLOR.copyLink }}>
              {copied ? t.copied : t.copyLink}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Width is pinned to the bonus line, the widest element in this column, so the
          button stays centred under it and neither can overflow the card. */}
      <View className="ml-1.5 items-center" style={{ width: 122 }}>
        <Pressable
          onPress={share}
          accessibilityRole="button"
          className="rounded-[10px] px-4 py-2 active:opacity-85"
          style={{ backgroundColor: COLOR.button }}
        >
          <Text className="text-[13px] font-bold text-white">{t.referNow}</Text>
        </Pressable>

        {referral.bonusPerSignup > 0 && (
          <Text className="mt-1 text-[9px]" style={{ color: COLOR.bonus }} numberOfLines={1}>
            {t.referralBonusPrefix}
            <Text className="font-bold" style={{ color: COLOR.bonusAmount }}>
              {` ₹${referral.bonusPerSignup} `}
            </Text>
            {t.referralBonusSuffix}
          </Text>
        )}
      </View>
    </View>
  );
};
