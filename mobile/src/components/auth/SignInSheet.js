import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../providers/AuthProvider';
import { useLanguage } from '../../providers/LanguageProvider';

const DEMO = { email: 'demo@feedants.com', password: 'Feedants@123' };

/**
 * Minimal sign-in surface so an unauthenticated viewer can complete a registration.
 * Auth UI is not the subject of this module, so it stays a single sheet rather than a
 * separate flow.
 */
export const SignInSheet = ({ visible, onClose, onSignedIn }) => {
  const { t } = useLanguage();
  const { signIn } = useAuth();
  const [email, setEmail] = useState(DEMO.email);
  const [password, setPassword] = useState(DEMO.password);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    setIsBusy(true);
    setError(null);
    try {
      const user = await signIn(email.trim(), password);
      onSignedIn?.(user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Pressable className="rounded-t-3xl bg-surface px-5 pb-8 pt-5" onPress={() => {}}>
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-bold text-ink">{t.signIn}</Text>
              <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button">
                <Ionicons name="close" size={22} color="#6B7280" />
              </Pressable>
            </View>

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              className="mt-4 rounded-xl border border-ink-line px-4 py-3 text-base text-ink"
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry
              className="mt-3 rounded-xl border border-ink-line px-4 py-3 text-base text-ink"
            />

            {error && <Text className="mt-2 text-xs text-red-600">{error}</Text>}

            <Pressable
              onPress={submit}
              disabled={isBusy}
              accessibilityRole="button"
              className="mt-4 items-center rounded-xl bg-primary py-3.5 active:opacity-85"
            >
              {isBusy ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-base font-bold text-white">{t.signIn}</Text>
              )}
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};
