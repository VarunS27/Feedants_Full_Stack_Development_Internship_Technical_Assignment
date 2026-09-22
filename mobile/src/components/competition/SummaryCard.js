import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { Chip } from '../ui/Chip';
import { ProgressBar } from '../ui/ProgressBar';
import { useLanguage } from '../../providers/LanguageProvider';
import { formatCurrency } from '../../utils/format';

const RegisteredBadge = ({ label }) => (
  <View className="flex-row items-center rounded-full bg-primary-soft px-3 py-1.5">
    <Ionicons name="checkmark-circle" size={15} color="#0E6E6E" />
    <Text className="ml-1.5 text-xs font-bold text-primary">{label}</Text>
  </View>
);

const Money = ({ label, value }) => (
  <View>
    <Text className="text-xs text-ink-muted">{label}</Text>
    <Text className="mt-1 text-xl font-bold text-primary">{value}</Text>
  </View>
);

/**
 * Header card: identity, pricing and live capacity. Every number here comes from the
 * server's computed lifecycle, so the spots figure cannot drift from the booking counter.
 */
export const SummaryCard = ({ competition }) => {
  const { t } = useLanguage();
  const { capacity } = competition.lifecycle;

  return (
    <Card className="px-4 py-4">
      <View className="flex-row items-start justify-between">
        <Text className="flex-1 pr-3 text-xl font-bold text-ink">{competition.title}</Text>
        {competition.viewer.isRegistered && <RegisteredBadge label={t.registered} />}
      </View>

      <View className="mt-3 flex-row flex-wrap items-center">
        {competition.tags.map((tag) => (
          <Chip key={tag} label={tag} className="mr-2" />
        ))}

        {competition.certificateProvided && (
          <View className="flex-row items-center">
            <MaterialCommunityIcons name="trophy-outline" size={16} color="#0E6E6E" />
            <Text className="ml-1.5 text-sm font-semibold text-primary">
              {t.winnersGetCertificate}
            </Text>
          </View>
        )}
      </View>

      <View className="mt-4 flex-row items-start justify-between">
        <View className="flex-row">
          <Money label={t.prizePool} value={formatCurrency(competition.prizePool)} />
          <View className="ml-8">
            <Money label={t.entryFee} value={formatCurrency(competition.entryFee)} />
          </View>
        </View>

        <View className="ml-4 flex-1 items-end">
          <View className="flex-row items-center">
            <Ionicons name="people-outline" size={15} color="#6B7280" />
            <Text className="ml-1.5 text-sm font-semibold text-ink">
              {t.spotsLeft(capacity.spotsLeft)}
            </Text>
          </View>
          <ProgressBar percent={capacity.filledPercent} className="mt-2" />
          <Text className="mt-1.5 text-xs text-ink-muted">
            {t.booked(capacity.bookedSpots, capacity.totalSpots)}
          </Text>
        </View>
      </View>
    </Card>
  );
};
