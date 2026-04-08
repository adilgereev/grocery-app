import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Story } from '@/types';
import { fetchActiveStories } from '@/lib/api/storiesApi';
import { logger } from '@/lib/utils/logger';

// Кеш 5 минут — сторис обновляются редко
const CACHE_TIMEOUT = 5 * 60 * 1000;

interface StoriesState {
  stories: Story[];
  isLoading: boolean;
  error: string | null;
  lastFetch: number | null;
  // Локальный список просмотренных сторис (сбрасывается при новых данных из БД)
  viewedIds: string[];

  fetchStories: (forceRefresh?: boolean) => Promise<void>;
  markAsViewed: (id: string) => void;
  isViewed: (id: string) => boolean;
}

export const useStoriesStore = create<StoriesState>()(
  persist(
    (set, get) => ({
      stories: [],
      isLoading: false,
      error: null,
      lastFetch: null,
      viewedIds: [],

      fetchStories: async (forceRefresh = false) => {
        const state = get();
        const now = Date.now();

        // Проверяем актуальность кеша
        if (!forceRefresh && state.stories.length > 0 && state.lastFetch) {
          if (now - state.lastFetch < CACHE_TIMEOUT) return;
        }

        try {
          set({ isLoading: true, error: null });
          const data = await fetchActiveStories();
          set({ stories: data, isLoading: false, lastFetch: now });
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Ошибка загрузки сторис';
          logger.error('Ошибка загрузки сторис:', error);
          set({ error: msg, isLoading: false });
        }
      },

      markAsViewed: (id: string) => {
        const { viewedIds } = get();
        if (!viewedIds.includes(id)) {
          set({ viewedIds: [...viewedIds, id] });
        }
      },

      isViewed: (id: string) => get().viewedIds.includes(id),
    }),
    {
      name: 'grocery-stories-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        stories: state.stories,
        lastFetch: state.lastFetch,
        viewedIds: state.viewedIds,
      }),
    }
  )
);
