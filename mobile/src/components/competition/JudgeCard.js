import React from 'react';
import { Image, Text, View } from 'react-native';
import { Card } from '../ui/Card';
import { PlayButton } from '../ui/PlayButton';
import { useLanguage } from '../../providers/LanguageProvider';

export const JudgeCard = ({ judge, onPlayIntro }) => {
  const { t } = useLanguage();

  return (
    <Card className="mt-3 flex-row items-center px-4 py-3.5">
      {/* Bundled judge portrait. A required asset carries intrinsic dimensions, so the
          56px box is pinned in style — a className size can lose to them. */}
      <Image
        source={require('../../../assets/manju.png')}
        style={{ width: 56, height: 56, borderRadius: 28 }}
        resizeMode="cover"
        className="bg-surface-chip"
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
