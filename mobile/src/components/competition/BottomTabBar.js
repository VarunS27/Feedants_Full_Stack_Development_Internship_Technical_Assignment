import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLanguage } from '../../providers/LanguageProvider';
import { useAuth } from '../../providers/AuthProvider';

const TabItem = ({ icon, label, isActive, onPress }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="tab"
    accessibilityState={{ selected: isActive }}
    className="flex-1 items-center py-1.5 active:opacity-70"
  >
    {icon}
    <Text
      className={`mt-0.5 text-2xs ${isActive ? 'font-bold text-primary' : 'text-ink-muted'}`}
    >
      {label}
    </Text>
  </Pressable>
);

export const BottomTabBar = ({ activeTab = 'competitions', onTabPress = () => {} }) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const colorFor = (key) => (activeTab === key ? '#0E6E6E' : '#6B7280');

  return (
    <View className="flex-row items-center border-t border-ink-line bg-surface px-2 pt-1.5">
      <TabItem
        label={t.home}
        isActive={activeTab === 'home'}
        onPress={() => onTabPress('home')}
        icon={<Ionicons name="home-outline" size={22} color={colorFor('home')} />}
      />
      <TabItem
        label={t.explore}
        isActive={activeTab === 'explore'}
        onPress={() => onTabPress('explore')}
        icon={<Ionicons name="search-outline" size={22} color={colorFor('explore')} />}
      />

      <Pressable
        onPress={() => onTabPress('create')}
        accessibilityRole="button"
        accessibilityLabel="Create"
        className="mx-1 items-center active:opacity-80"
      >
        <View className="h-12 w-12 items-center justify-center rounded-full bg-primary">
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </View>
      </Pressable>

      <TabItem
        label={t.competitions}
        isActive={activeTab === 'competitions'}
        onPress={() => onTabPress('competitions')}
        icon={
          <MaterialCommunityIcons
            name="trophy-outline"
            size={22}
            color={colorFor('competitions')}
          />
        }
      />
      <TabItem
        label={t.profile}
        isActive={activeTab === 'profile'}
        onPress={() => onTabPress('profile')}
        icon={
          user?.avatarUrl ? (
            <Image
              source={{ uri: user.avatarUrl }}
              className="h-6 w-6 rounded-full"
              accessibilityIgnoresInvertColors
            />
          ) : (
            <Ionicons name="person-circle-outline" size={23} color={colorFor('profile')} />
          )
        }
      />
    </View>
  );
};
