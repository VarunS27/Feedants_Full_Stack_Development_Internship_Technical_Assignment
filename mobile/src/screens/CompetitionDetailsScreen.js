import React, { useCallback, useState } from 'react';
import { Linking, RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as DocumentPicker from 'expo-document-picker';

import { ScreenHeader } from '../components/competition/ScreenHeader';
import { SummaryCard } from '../components/competition/SummaryCard';
import { JudgeCard } from '../components/competition/JudgeCard';
import { CountdownBanner } from '../components/competition/CountdownBanner';
import { ImportantDates } from '../components/competition/ImportantDates';
import { PreviousWinners } from '../components/competition/PreviousWinners';
import { InfoTabs } from '../components/competition/InfoTabs';
import { RewardsList } from '../components/competition/RewardsList';
import { DisclaimerNote, PrizeAndTrust } from '../components/competition/TrustSection';
import { ReferAndEarn } from '../components/competition/ReferAndEarn';
import { UserVoices, AdSlot } from '../components/competition/FooterSections';
import { PrimaryActionBar } from '../components/competition/PrimaryActionBar';
import { BottomTabBar } from '../components/competition/BottomTabBar';
import { DetailsSkeleton, ErrorState } from '../components/competition/ScreenStates';
import { ActionFeedback } from '../components/competition/ActionFeedback';
import { SignInSheet } from '../components/auth/SignInSheet';

import { useCompetition, useRegister, useSubmitEntry } from '../hooks/useCompetition';
import { useAuth } from '../providers/AuthProvider';
import { useLanguage } from '../providers/LanguageProvider';
import { uploadFile } from '../api/uploads';
import { runCheckout } from '../services/checkout';

const DEFAULT_COMPETITION = 'feedants-classical-dance';

const newIdempotencyKey = () =>
  `reg_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

export const CompetitionDetailsScreen = ({ route, navigation }) => {
  const idOrSlug = route?.params?.competitionId ?? DEFAULT_COMPETITION;
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  const { data: competition, isLoading, isError, error, refetch, isRefetching } =
    useCompetition(idOrSlug);
  const register = useRegister(idOrSlug);
  const submitEntry = useSubmitEntry(idOrSlug);

  const [isSignInVisible, setSignInVisible] = useState(false);
  const [isUploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const openMedia = useCallback((url) => {
    if (!url) return;
    Linking.openURL(url).catch(() =>
      setFeedback({ type: 'error', message: 'Unable to open this video.' })
    );
  }, []);

  /** A deadline passing mid-session invalidates the CTA, so ask the server for the truth. */
  const handleCountdownExpiry = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleRegister = useCallback(async () => {
    if (!isAuthenticated) {
      setSignInVisible(true);
      return;
    }
    setFeedback(null);
    try {
      // Pay first, then book: the spot is only consumed once payment is proven, so a
      // failed payment never holds capacity away from other users.
      const payment = await runCheckout(idOrSlug);
      await register.mutateAsync({ idempotencyKey: newIdempotencyKey(), payment });
      setFeedback({ type: 'success', message: t.registrationConfirmed });
    } catch (err) {
      // Business-rule rejections are expected outcomes, not crashes: show why.
      setFeedback({ type: 'error', message: err.message });
    }
  }, [isAuthenticated, idOrSlug, register, t]);

  const handleSubmission = useCallback(async () => {
    setFeedback(null);
    try {
      const picked = await DocumentPicker.getDocumentAsync({
        type: ['video/*', 'image/*', 'audio/*'],
        copyToCacheDirectory: true,
      });
      if (picked.canceled) return;

      const asset = picked.assets[0];
      setUploading(true);

      const uploaded = await uploadFile({
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType,
      });

      await submitEntry.mutateAsync({
        fileUrl: uploaded.fileUrl,
        fileName: uploaded.fileName,
        mimeType: uploaded.mimeType,
        sizeBytes: uploaded.sizeBytes,
      });
      setFeedback({ type: 'success', message: t.submissionUploaded });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setUploading(false);
    }
  }, [submitEntry, t]);

  const handleCtaPress = useCallback(
    (intent) => {
      if (intent === 'register') return handleRegister();
      if (intent === 'submit') return handleSubmission();
      // A dedicated results screen is outside this module; acknowledge rather than no-op.
      if (intent === 'results') {
        return setFeedback({ type: 'success', message: t.resultsDeclared });
      }
      return undefined;
    },
    [handleRegister, handleSubmission, t]
  );

  const goBack = () => (navigation?.canGoBack?.() ? navigation.goBack() : undefined);

  return (
    <SafeAreaView className="flex-1 bg-surface-page" edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <ScreenHeader onBack={goBack} />

      {isLoading && <DetailsSkeleton />}

      {isError && !competition && <ErrorState error={error} onRetry={refetch} />}

      {competition && (
        <>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor="#0E6E6E"
                colors={['#0E6E6E']}
              />
            }
          >
            <SummaryCard competition={competition} />

            <JudgeCard judge={competition.judge} onPlayIntro={openMedia} />

            <CountdownBanner competition={competition} onExpire={handleCountdownExpiry} />

            <ImportantDates dates={competition.dates} />

            <PreviousWinners winners={competition.previousWinners} onPlay={openMedia} />

            <InfoTabs content={competition.content} />

            <RewardsList rewards={competition.rewards} />

            <DisclaimerNote text={competition.disclaimer} />

            <PrizeAndTrust competition={competition} onPlayPrizeVideo={openMedia} />

            <ReferAndEarn
              referral={competition.referral}
              competitionTitle={competition.title}
            />

            <UserVoices onPress={() => {}} />

            <AdSlot />
          </ScrollView>

          <View className="bg-surface pt-1">
            <ActionFeedback feedback={feedback} onDismiss={() => setFeedback(null)} />
            <PrimaryActionBar
              competition={competition}
              isBusy={register.isPending || submitEntry.isPending || isUploading}
              onPress={handleCtaPress}
            />
            <BottomTabBar activeTab="competitions" />
          </View>
        </>
      )}

      <SignInSheet
        visible={isSignInVisible}
        onClose={() => setSignInVisible(false)}
        onSignedIn={() => refetch()}
      />
    </SafeAreaView>
  );
};
