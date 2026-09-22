import React from 'react';
import { FlatList, Image, Pressable, Text, View } from 'react-native';
import { Card } from '../ui/Card';
import { PlayButton } from '../ui/PlayButton';
import { useLanguage } from '../../providers/LanguageProvider';
import { ordinalPosition } from '../../utils/format';

const WinnerTile = ({ winner, onPlay, label }) => (
  <Pressable
    onPress={() => onPlay(winner.videoUrl)}
    accessibilityRole="button"
    accessibilityLabel={`${winner.name}, ${label}`}
    className="mr-2.5 flex-row items-center rounded-xl bg-surface-page p-1.5 active:opacity-80"
    style={{ width: 168 }}
  >
    <View>
      <Image
        source={{ uri: winner.thumbnailUrl }}
        className="h-14 w-14 rounded-lg bg-ink-line"
        accessibilityIgnoresInvertColors
      />
      <View className="absolute inset-0 items-center justify-center">
        <PlayButton size="sm" decorative />
      </View>
    </View>

    <View className="ml-2.5 flex-1">
      <Text className="text-sm font-semibold text-ink" numberOfLines={1}>
        {winner.name}
      </Text>
      <Text className="mt-0.5 text-xs text-primary" numberOfLines={1}>
        {label}
      </Text>
    </View>
  </Pressable>
);

export const PreviousWinners = ({ winners, onPlay }) => {
  const { t, language } = useLanguage();

  if (!winners?.length) return null;

  return (
    <Card className="mt-3 py-4 pl-4">
      <Text className="text-base font-bold text-ink">{t.previousWinners}</Text>

      <FlatList
        className="mt-3"
        data={winners}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 16 }}
        renderItem={({ item }) => (
          <WinnerTile
            winner={item}
            onPlay={onPlay}
            label={`${ordinalPosition(item.position, language)} ${
              language === 'hi' ? 'विजेता' : 'Winner'
            }`}
          />
        )}
      />
    </Card>
  );
};
