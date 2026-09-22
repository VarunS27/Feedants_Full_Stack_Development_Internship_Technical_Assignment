import React from 'react';
import { Image, Text, View } from 'react-native';
import { Card } from '../ui/Card';
import { PlayButton } from '../ui/PlayButton';
import { useLanguage } from '../../providers/LanguageProvider';

export const JudgeCard = ({ judge, onPlayIntro }) => {
  const { t } = useLanguage();

  return (
    <Card className="mt-3 flex-row items-center px-4 py-3.5">
      <Image
        source={{ uri: judge.photoUrl }}
        className="h-14 w-14 rounded-full bg-surface-chip"
        accessibilityIgnoresInvertColors
      />

      <View className="ml-3.5 flex-1">
        <Text className="text-xs text-ink-muted">{t.judge}</Text>
        <Text className="text-base font-bold text-ink">{judge.name}</Text>
        <Text className="mt-0.5 text-xs text-ink-muted">{judge.title}</Text>
        <Text className="text-xs text-ink-muted">
          {t.yearsOfExperience(judge.experienceYears)}
        </Text>
      </View>

      {judge.introVideoUrl && (
        <View className="items-center">
          <PlayButton
            size="md"
            variant="soft"
            onPress={() => onPlayIntro(judge.introVideoUrl)}
            accessibilityLabel={t.introVideo}
          />
          <Text className="mt-1 text-xs text-ink-muted">{t.introVideo}</Text>
        </View>
      )}
    </Card>
  );
};
