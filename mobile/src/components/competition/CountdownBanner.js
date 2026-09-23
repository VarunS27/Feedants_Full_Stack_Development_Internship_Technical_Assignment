import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCountdown } from '../../hooks/useCountdown';
import { useLanguage } from '../../providers/LanguageProvider';
import { pad } from '../../utils/format';

const URGENT_THRESHOLD_MS = 48 * 60 * 60 * 1000;

/**
 * Picks the deadline that actually matters at this point in the lifecycle, so the
 * banner keeps counting down to something meaningful instead of disappearing once
 * registration closes.
 */
const resolveTarget = (competition, t) => {
  const { lifecycle, dates } = competition;

  if (lifecycle.registration.isOpen) {
    return { label: t.registrationClosesIn, target: dates.registerBefore };
  }
  if (lifecycle.submission.isOpen) {
    return { label: t.submissionClosesIn, target: dates.submissionEnds };
  }
  if (!lifecycle.results.isDeclared) {
    return { label: t.resultsIn, target: dates.resultDate };
  }
  return null;
};

export const CountdownBanner = ({ competition, onExpire }) => {
  const { t } = useLanguage();
  const resolved = resolveTarget(competition, t);

  // Hooks must run unconditionally; a null target simply produces a zeroed countdown.
  const remaining = useCountdown(resolved?.target ?? null, onExpire);

  if (!resolved || remaining.isExpired) return null;

  const isUrgent = remaining.totalMs <= URGENT_THRESHOLD_MS;

  return (
    <View className="mt-3 flex-row items-center rounded-card bg-primary-soft px-3 py-3">
      <MaterialCommunityIcons name="timer-sand" size={16} color="#0E6E6E" />
      {/* The label yields space; the timer must never truncate. */}
      <Text className="ml-1.5 flex-1 text-[11px] font-bold text-black" numberOfLines={1}>
        {resolved.label}
      </Text>

      <Text
        className="mx-1 text-[13px] font-bold text-primary"
        numberOfLines={1}
        accessibilityLiveRegion="polite"
      >
        {`${pad(remaining.days)}${t.days} : ${pad(remaining.hours)}${t.hours} : ${pad(
          remaining.minutes
        )}${t.minutes} : ${pad(remaining.seconds)}${t.seconds}`}
      </Text>

      {isUrgent && (
        <View className="flex-row items-center">
          <Ionicons name="stopwatch-outline" size={15} color="#0E6E6E" />
          <Text className="ml-1 text-[12px] text-primary font-bold" numberOfLines={1}>
            {t.hurryUp}
          </Text>
        </View>
      )}
    </View>
  );
};
