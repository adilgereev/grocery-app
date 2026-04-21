import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '@/types';
import { fetchPopularProducts } from '@/lib/api/productsApi';
import { logger } from '@/lib/utils/logger';

const CACHE_TIMEOUT = 5 * 60 * 1000;

interface PopularProductsState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  lastFetch: number | null;
  fetchProducts: (forceRefresh?: boolean) => Promise<void>;
  invalidateCache: () => void;
}

export const usePopularProductsStore = create<PopularProductsState>()(
  persist(
    (set, get) => ({
      products: [],
      isLoading: false,
      error: null,
      lastFetch: null,

      fetchProducts: async (forceRefresh = false) => {
        const state = get();
        const now = Date.now();

        if (!forceRefresh && state.products.length > 0 && state.lastFetch) {
          if (now - state.lastFetch < CACHE_TIMEOUT) return;
        }

        if (forceRefresh) {
          set({ lastFetch: null });
        }

        try {
          set({ isLoading: true, error: null });
          const data = await fetchPopularProducts(12);
          set({ products: data, isLoading: false, lastFetch: Date.now() });
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Ошибка загрузки популярных товаров';
          logger.error('Ошибка загрузки популярных товаров:', error);
          set({ error: msg, isLoading: false });
        }
      },

      invalidateCache: () => set({ lastFetch: null }),
    }),
    {
      name: 'grocery-popular-products-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        products: state.products,
        lastFetch: state.lastFetch,
      }),
    }
  )
);
