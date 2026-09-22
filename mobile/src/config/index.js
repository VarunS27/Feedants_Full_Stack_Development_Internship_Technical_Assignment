import Constants from 'expo-constants';

/**
 * Resolves the API host so the same build works on an emulator, a simulator and a
 * physical device on the LAN: Expo already knows the host serving the bundle, so the
 * device reuses it instead of hardcoding an IP that only works on one machine.
 * Override explicitly with EXPO_PUBLIC_API_URL when pointing at a deployed backend.
 */
const inferDevHost = () => {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.expoGoConfig?.debuggerHost ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost;

  if (hostUri) return hostUri.split(':')[0];
  return 'localhost';
};

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || `http://${inferDevHost()}:5000/api`;

export const REQUEST_TIMEOUT_MS = 15000;

export const STORAGE_KEYS = {
  token: 'feedants.auth.token',
  language: 'feedants.language',
};
