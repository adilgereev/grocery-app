import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppStore {
  isReady: boolean;
  initialize: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  isReady: false,
  initialize: () => {
    set({ isReady: true });
  },
}));
