import React from 'react';
import { Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { useLanguage } from '../../providers/LanguageProvider';
import { formatCurrency, ordinalPosition } from '../../utils/format';

/** Top three get medals; the rest get a star, matching the design's reward table. */
const PositionIcon = ({ position }) => {
  const medals = {
    1: { name: 'trophy', color: '#F5A623' },
    2: { name: 'medal', color: '#B9C0C7' },
    3: { name: 'medal', color: '#CD7F32' },
  };
  const medal = medals[position];

  return medal ? (
    <MaterialCommunityIcons name={medal.name} size={20} color={medal.color} />
  ) : (
    <MaterialCommunityIcons name="star-outline" size={20} color="#0E6E6E" />
  );
};

export const RewardsList = ({ rewards }) => {
  const { t, language } = useLanguage();

  if (!rewards?.length) return null;

  return (
    <Card className="mt-3 px-4 py-4">
      <View className="flex-row items-baseline">
        <Text className="text-base font-bold text-ink">{t.rewards}</Text>
        <Text className="ml-2 text-xs text-ink-muted">{t.allPositions}</Text>
      </View>

      <View className="mt-2">
        {rewards.map((reward, index) => (
          <View
            key={reward.position}
            className={`flex-row items-center justify-between py-2.5 ${
              index === 0 ? '' : 'border-t border-ink-line/70'
            }`}
          >
            <View className="flex-row items-center">
              <PositionIcon position={reward.position} />
              <Text className="ml-3 text-sm text-ink">
                {reward.label ||
                  `${ordinalPosition(reward.position, language)} ${
                    language === 'hi' ? 'विजेता' : 'Winner'
                  }`}
              </Text>
            </View>
            <Text className="text-sm font-bold text-ink">{formatCurrency(reward.amount)}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
};
