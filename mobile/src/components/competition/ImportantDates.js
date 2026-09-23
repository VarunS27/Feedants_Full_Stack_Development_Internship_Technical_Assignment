import React from 'react';
import { Text, View } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { useLanguage } from '../../providers/LanguageProvider';
import { formatShortDate, formatTime } from '../../utils/format';

const DateCell = ({ icon, label, iso, language, className = '' }) => (
  <View className={`flex-1 flex-row items-start p-3 ${className}`}>
    <View className="mt-0.5">{icon}</View>
    <View className="ml-2.5 flex-1">
      <Text className="text-xs text-ink-muted" numberOfLines={2}>
        {label}
      </Text>
      <Text className="mt-1 text-sm font-bold text-primary">
        {formatShortDate(iso, language)}
      </Text>
      <Text className="text-xs text-black font-bold">{formatTime(iso)}</Text>
    </View>
  </View>
);

export const ImportantDates = ({ dates }) => {
  const { t, language } = useLanguage();

  return (
    <Card className="mt-3 px-4 py-4">
      <Text className="text-base font-bold text-ink">{t.importantDates}</Text>

      <View className="mt-3 rounded-xl border border-ink-line">
        <View className="flex-row border-b border-ink-line">
          <DateCell
            icon={<Ionicons name="calendar-outline" size={18} color="#0E6E6E" />}
            label={t.registerBefore}
            iso={dates.registerBefore}
            language={language}
            className="border-r border-ink-line"
          />
          <DateCell
            icon={<Feather name="send" size={17} color="#0E6E6E" />}
            label={t.submissionStarts}
            iso={dates.submissionStarts}
            language={language}
          />
        </View>

        <View className="flex-row">
          <DateCell
            icon={<Feather name="upload" size={17} color="#0E6E6E" />}
            label={t.submissionEnds}
            iso={dates.submissionEnds}
            language={language}
            className="border-r border-ink-line"
          />
          <DateCell
            icon={<MaterialCommunityIcons name="trophy-outline" size={18} color="#0E6E6E" />}
            label={t.resultDate}
            iso={dates.resultDate}
            language={language}
          />
        </View>
      </View>
    </Card>
  );
};
