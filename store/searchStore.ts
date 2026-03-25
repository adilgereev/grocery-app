import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SearchStore {
  history: string[];
  isLoading: boolean;
  error: string | null;
  addSearchQuery: (query: string) => void;
  removeSearchQuery: (query: string) => void;
  clearHistory: () => void;
}

export const useSearchStore = create<SearchStore>()(
  persist(
    (set, get) => ({
      history: [],
      isLoading: false,
      error: null,

      addSearchQuery: (query: string) => {
        const trimmed = query.trim();
        if (!trimmed) return;

        // Удаляем дубликаты, чтобы новый запрос всегда был наверху
        const currentHistory = get().history.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
        // Ограничиваем историю 10 последними запросами
        set({ history: [trimmed, ...currentHistory].slice(0, 10) });
      },

      removeSearchQuery: (query: string) => {
        set({ history: get().history.filter((item) => item !== query) });
      },

      clearHistory: () => {
        set({ history: [], error: null });
      },
    }),
    {
      name: 'search-history-storage', // уникальное имя для AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
