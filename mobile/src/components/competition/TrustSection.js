import React from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { PlayButton } from '../ui/PlayButton';
import { useLanguage } from '../../providers/LanguageProvider';

export const DisclaimerNote = ({ text }) => {
  const { t } = useLanguage();
  if (!text) return null;

  return (
    <View className="mt-3 flex-row items-start rounded-card bg-primary-tint px-3.5 py-3">
      <Ionicons name="information-circle-outline" size={17} color="#0E6E6E" />
      <Text className="ml-2 flex-1 text-xs leading-5 text-ink-muted">
        <Text className="font-bold text-ink">{t.disclaimer} </Text>
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
            <Text className="text-xs text-ink">{t.refundPolicy}</Text>
          </Pressable>
        </TrustRow>

        <TrustRow icon={<Ionicons name="shield-checkmark-outline" size={16} color="#0E6E6E" />}>
          <Text className="text-xs text-ink">{t.securePayments} </Text>
          <Text className="text-xs font-bold text-[#2B6CB0]">
            {policies?.paymentPartner ?? 'Razorpay'}
          </Text>
        </TrustRow>
      </View>
    </Card>
  );
};
