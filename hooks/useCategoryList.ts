import { useCallback, useEffect, useState } from 'react';
import { Category } from '@/types';
import { fetchAllCategories } from '@/lib/api/adminApi';

interface UseCategoryListResult {
  categories: Category[];
  categoriesLoading: boolean;
}

/**
 * Хук для загрузки плоского списка всех категорий (для пикеров в admin-формах).
 */
export function useCategoryList(): UseCategoryListResult {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await fetchAllCategories();
      setCategories(data);
    } catch {
      // Ошибка загрузки — список остаётся пустым
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { categories, categoriesLoading };
}
