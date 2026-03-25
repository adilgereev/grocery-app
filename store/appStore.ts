import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppStore {
  hasSeenOnboarding: boolean;
  isReady: boolean;
  setHasSeenOnboarding: (value: boolean) => void;
  checkOnboarding: () => Promise<void>;
}

export const useAppStore = create<AppStore>((set) => ({
  hasSeenOnboarding: false,
  isReady: false,
  setHasSeenOnboarding: (value) => {
    set({ hasSeenOnboarding: value });
    if (value) {
      AsyncStorage.setItem('has_seen_onboarding', 'true').catch(() => {});
    } else {
      AsyncStorage.removeItem('has_seen_onboarding').catch(() => {});
    }
  },
  checkOnboarding: async () => {
    try {
      const value = await AsyncStorage.getItem('has_seen_onboarding');
      set({ hasSeenOnboarding: value === 'true' });
    } catch {
      set({ hasSeenOnboarding: false });
    } finally {
      set({ isReady: true });
    }
  },
}));
