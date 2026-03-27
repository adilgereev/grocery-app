import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { logger } from '@/lib/logger';

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
      const { data, error } = await supabase
        .from('favorites')
        .select('product_id')
        .eq('user_id', userId);

      if (!error && data) {
        set({ favoriteIds: data.map(f => f.product_id), isLoading: false });
      } else {
        set({ error: error?.message || 'Не удалось загрузить избранное', isLoading: false });
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Не удалось загрузить избранное';
      logger.error('Ошибка загрузки избранного:', e);
      set({ error: errorMessage, isLoading: false });
    }
  },

  toggleFavorite: async (product: Product, userId: string) => {
    try {
      const { favoriteIds } = get();
      const isFavorite = favoriteIds.includes(product.id);

      // Оптимистичное обновление UI: мгновенно перерисовываем сердечки, не дожидаясь базы
      if (isFavorite) {
        set({ favoriteIds: favoriteIds.filter(id => id !== product.id) });
        await supabase.from('favorites').delete().eq('user_id', userId).eq('product_id', product.id);
      } else {
        set({ favoriteIds: [...favoriteIds, product.id] });
        await supabase.from('favorites').insert({ user_id: userId, product_id: product.id });
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Не удалось обновить избранное';
      logger.error('Ошибка обновления избранного:', e);
      set({ error: errorMessage });
    }
  },

  clearFavorites: () => set({ favoriteIds: [], error: null }),
}));
