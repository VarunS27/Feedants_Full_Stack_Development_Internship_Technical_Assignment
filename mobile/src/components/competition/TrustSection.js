import React from 'react';
import { Image, Linking, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { PlayButton } from '../ui/PlayButton';
import { useLanguage } from '../../providers/LanguageProvider';

/** Shared accent, sampled from the design's reward amounts. */
const ACCENT = '#046B74';

export const DisclaimerNote = ({ text }) => {
  const { t } = useLanguage();
  if (!text) return null;

  return (
    <View className="mt-3 flex-row items-start rounded-card bg-primary-tint px-3.5 py-3">
      <Ionicons name="information-circle-outline" size={17} color={ACCENT} />
      <Text className="ml-2 flex-1 text-xs leading-5 text-ink">
        <Text className="font-bold" style={{ color: ACCENT }}>
          {t.disclaimer}{' '}
        </Text>
        {text}
      </Text>
    </View>
  );
};

const TrustRow = ({ icon, children }) => (
  <View className="flex-row items-center py-1">
    {icon}
    <View className="ml-2 flex-1 flex-row flex-wrap items-center">{children}</View>
  </View>
);

export const PrizeAndTrust = ({ competition, onPlayPrizeVideo }) => {
  const { t } = useLanguage();
  const { policies, media } = competition;

  const openRefundPolicy = () => {
    if (policies?.refundPolicyUrl) Linking.openURL(policies.refundPolicyUrl).catch(() => {});
  };

  return (
    <Card className="mt-3 flex-row items-center px-3.5 py-3">
      <Pressable
        onPress={() => onPlayPrizeVideo(media?.prizeMoneyVideoUrl)}
        accessibilityRole="button"
        className="flex-1 flex-row items-center active:opacity-70"
      >
        <PlayButton size="lg" variant="soft" decorative />
        <View className="ml-2.5 flex-1">
          <Text className="text-sm font-bold text-ink">{t.prizeMoneyTitle}</Text>
          <Text className="mt-0.5 text-xs text-primary">{t.prizeMoneySubtitle}</Text>
        </View>
      </Pressable>

      <View className="ml-3 flex-1 border-l border-ink-line pl-3">
        <TrustRow icon={<Ionicons name="shield-checkmark-outline" size={16} color="#0E6E6E" />}>
          <Pressable onPress={openRefundPolicy} accessibilityRole="link">
            <Text className="text-xs font-semibold text-ink">{t.refundPolicy}</Text>
          </Pressable>
        </TrustRow>

        <TrustRow icon={<Ionicons name="shield-checkmark-outline" size={16} color="#0E6E6E" />}>
          <Text className="text-xs font-semibold text-ink">{t.securePayments} </Text>
          {/* Asset is 216x48; the explicit ratio keeps the wordmark undistorted. */}
          <Image
            source={require('../../../assets/razorpay.png')}
            style={{ width: 54, height: 12 }}
            resizeMode="contain"
            accessibilityLabel={policies?.paymentPartner ?? 'Razorpay'}
          />
        </TrustRow>
      </View>
    </Card>
  );
};
