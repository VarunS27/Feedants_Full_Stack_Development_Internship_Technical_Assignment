import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { useLanguage } from '../../providers/LanguageProvider';

const COLLAPSED_LINES = 3;

const BulletList = ({ items, limit }) => {
  const visible = limit ? items.slice(0, limit) : items;
  return (
    <View>
      {visible.map((item, index) => (
        <View key={index} className="mt-1.5 flex-row">
          <Text className="text-sm leading-5 text-ink-muted">• </Text>
          <Text className="flex-1 text-sm leading-5 text-ink-muted">{item}</Text>
        </View>
      ))}
    </View>
  );
};

export const InfoTabs = ({ content }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('about');
  const [expanded, setExpanded] = useState(false);

  const tabs = useMemo(
    () => [
      { key: 'about', label: t.aboutCompetition },
      { key: 'judging', label: t.judgingParameters },
      { key: 'rules', label: t.rulesAndEligibility },
    ],
    [t]
  );

  const items = {
    judging: content.judgingParameters,
    rules: content.rulesAndEligibility,
  }[activeTab];

  const body =
    activeTab === 'about' ? (
      <Text
        className="text-sm leading-6 text-ink-muted"
        numberOfLines={expanded ? undefined : COLLAPSED_LINES}
      >
        {content.about}
      </Text>
    ) : (
      <BulletList items={items} limit={expanded ? null : COLLAPSED_LINES} />
    );

  // "View more" only earns its place when there is actually more to reveal.
  const hasOverflow =
    activeTab === 'about'
      ? content.about?.length > 120 || content.about?.includes('\n')
      : items.length > COLLAPSED_LINES;

  return (
    <Card className="mt-3 pt-1">
      <View className="flex-row border-b border-ink-line">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => {
                setActiveTab(tab.key);
                setExpanded(false);
              }}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              className="flex-1 items-center px-1 py-3"
            >
              <Text
                className={`text-center text-xs font-semibold ${
                  isActive ? 'text-primary' : 'text-ink-muted'
                }`}
                numberOfLines={2}
              >
                {tab.label}
              </Text>
              {isActive && <View className="mt-2.5 h-0.5 w-full rounded-full bg-primary" />}
            </Pressable>
          );
        })}
      </View>

      <View className="px-4 pb-3 pt-3.5">
        {body}

        {hasOverflow && (
          <Pressable
            onPress={() => setExpanded((prev) => !prev)}
            accessibilityRole="button"
            className="mt-2.5 flex-row items-center justify-center active:opacity-70"
          >
            <Text className="text-sm font-semibold text-primary">
              {expanded ? t.viewLess : t.viewMore}
            </Text>
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={16}
              color="#0E6E6E"
              style={{ marginLeft: 4 }}
            />
          </Pressable>
        )}
      </View>
    </Card>
  );
};
