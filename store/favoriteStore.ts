import { create } from 'zustand';
import { fetchFavoriteIds, addToFavorites, removeFromFavorites } from '@/lib/api/favoriteApi';
import { Product } from '@/types';
import { logger } from '@/lib/utils/logger';

interface FavoriteStore {
  favoriteIds: string[];
  isLoading: boolean;
  error: string | null;
  fetchFavorites: (userId: string) => Promise<void>;
  toggleFavorite: (product: Product, userId: string) => Promise<void>;
  clearFavorites: () => void;
  clearError: () => void;
}

export const useFavoriteStore = create<FavoriteStore>((set, get) => ({
  favoriteIds: [],
  isLoading: false,
  error: null,

  clearError: () => {
    set({ error: null, isLoading: false });
  },

  fetchFavorites: async (userId) => {
    try {
      set({ isLoading: true });
      const ids = await fetchFavoriteIds(userId);
      set({ favoriteIds: ids, isLoading: false });
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Не удалось загрузить избранное';
      logger.error('Ошибка загрузки избранного:', e);
      set({ error: errorMessage, isLoading: false });
    }
  },

  toggleFavorite: async (product: Product, userId: string) => {
    const { favoriteIds } = get();
    const previousIds = [...favoriteIds];
    const isFavorite = favoriteIds.includes(product.id);

    // Оптимистичное обновление UI
    if (isFavorite) {
      set({ favoriteIds: favoriteIds.filter(id => id !== product.id) });
    } else {
      set({ favoriteIds: [...favoriteIds, product.id] });
    }

    try {
      if (isFavorite) {
        await removeFromFavorites(userId, product.id);
      } else {
        await addToFavorites(userId, product.id);
      }
    } catch (e: unknown) {
      // Откат к предыдущему состоянию при ошибке API
      set({ favoriteIds: previousIds });
      const errorMessage = e instanceof Error ? e.message : 'Не удалось обновить избранное';
      logger.error('Ошибка обновления избранного:', e);
      set({ error: errorMessage });
    }
  },

  clearFavorites: () => set({ favoriteIds: [], error: null }),
}));
