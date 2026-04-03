import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category, CategoryWithSubcategories, CategoryWithHierarchy } from '@/types';
import { logger } from '@/lib/logger';
import { fetchRootCategories, fetchFullHierarchy, fetchCategoriesWithHierarchy } from '@/lib/categoriesApi';

interface CategoryState {
  // Хранилище иерархии категорий
  rootCategories: Category[];
  categoriesWithSubs: CategoryWithSubcategories[];
  allCategories: CategoryWithHierarchy[];

  // Состояние загрузки
  isLoading: boolean;
  error: string | null;
  lastFetch: number | null;

  // Cache timeout в миллисекундах (5 минут)
  cacheTimeout: number;

  // Actions
  fetchRootCategories: (forceRefresh?: boolean) => Promise<void>;
  fetchFullHierarchy: (forceRefresh?: boolean) => Promise<void>;
  fetchAllCategories: (forceRefresh?: boolean) => Promise<void>;
  getCategoryById: (id: string) => Category | undefined;
  getSubcategories: (parentId: string) => Category[];
  clearError: () => void;
  invalidateCache: () => void;
}

const CACHE_TIMEOUT = 1 * 60 * 1000; // 1 минута в режиме активной настройки (было 5)

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set, get) => ({
      rootCategories: [],
      categoriesWithSubs: [],
      allCategories: [],
      isLoading: false,
      error: null,
      lastFetch: null,
      cacheTimeout: CACHE_TIMEOUT,

      clearError: () => {
        set({ error: null, isLoading: false });
      },

      invalidateCache: () => {
        set({ lastFetch: null });
      },

      fetchRootCategories: async (forceRefresh = false) => {
        const state = get();
        const now = Date.now();

        // Проверяем кеш: если не forceRefresh и данные свежие
        if (!forceRefresh && state.rootCategories.length > 0 && state.lastFetch) {
          const age = now - state.lastFetch;
          if (age < state.cacheTimeout) {
            return; // Данные актуальны, не перезагружаем
          }
        }

        try {
          set({ isLoading: true, error: null });
          const data = await fetchRootCategories();

          set({
            rootCategories: data,
            isLoading: false,
            lastFetch: now
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Не удалось загрузить категории';
          logger.error('Ошибка загрузки категорий:', error);
          set({ error: errorMessage, isLoading: false });
        }
      },

      fetchFullHierarchy: async (forceRefresh = false) => {
        const state = get();
        const now = Date.now();

        // Проверяем актуальность кеша
        if (!forceRefresh && state.categoriesWithSubs.length > 0 && state.lastFetch) {
          const age = now - state.lastFetch;
          if (age < state.cacheTimeout) {
            return; // Кеш свежий, выходим
          }
        }
        
        // Если принудительно — сбрасываем время сразу (до запроса), чтобы не было гонки
        if (forceRefresh) {
          set({ lastFetch: null });
        }

        try {
          console.log('📦 [DEBUG] fetchFullHierarchy start. Force:', forceRefresh);
          set({ isLoading: true, error: null });
          const data = await fetchFullHierarchy();

          // Извлекаем корни для упрощенного списка rootCategories
          const roots = data.map(({ subcategories, ...root }) => root as Category);

          set({
            categoriesWithSubs: data,
            rootCategories: roots,
            isLoading: false,
            lastFetch: now
          });
          logger.info(`Иерархия категорий обновлена (${data.length} корней)`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Не удалось загрузить иерархию категорий';
          logger.error('Ошибка загрузки иерархии:', error);
          set({ error: errorMessage, isLoading: false });
        }
      },

      fetchAllCategories: async (forceRefresh = false) => {
        const state = get();
        const now = Date.now();

        if (!forceRefresh && state.allCategories.length > 0 && state.lastFetch) {
          const age = now - state.lastFetch;
          if (age < state.cacheTimeout) {
            return;
          }
        }

        try {
          set({ isLoading: true, error: null });
          const data = await fetchCategoriesWithHierarchy();

          set({
            allCategories: data,
            isLoading: false,
            lastFetch: now
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Не удалось загрузить все категории';
          logger.error('Ошибка загрузки категорий:', error);
          set({ error: errorMessage, isLoading: false });
        }
      },

      getCategoryById: (id: string) => {
        const state = get();
        return state.allCategories.find(c => c.id === id);
      },

      getSubcategories: (parentId: string) => {
        const state = get();
        return state.allCategories.filter(c => c.parent_id === parentId);
      },

    }),
    {
      name: 'grocery-categories-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Не персистим isLoading и error
      partialize: (state) => ({
        rootCategories: state.rootCategories,
        categoriesWithSubs: state.categoriesWithSubs,
        allCategories: state.allCategories,
        lastFetch: state.lastFetch,
      }),
    }
  )
);
