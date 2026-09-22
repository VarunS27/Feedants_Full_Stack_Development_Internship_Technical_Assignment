import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './AuthProvider';
import { LanguageProvider } from './LanguageProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Competition state is time-sensitive (spots, deadlines), so cached data is
      // treated as stale quickly and refetched whenever the screen regains focus.
      staleTime: 10_000,
      retry: (failureCount, error) => error?.status >= 500 && failureCount < 2,
      refetchOnWindowFocus: true,
    },
    mutations: { retry: false },
  },
});

export const AppProviders = ({ children }) => (
  <SafeAreaProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>{children}</LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  </SafeAreaProvider>
);

export { queryClient };
