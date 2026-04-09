import { create } from 'zustand';

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
