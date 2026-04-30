import { useMemo } from 'react';
import { useCategoryStore } from '@/store/categoryStore';

export function useCategoryData(categoryId: string | string[] | undefined) {
  const allCategories = useCategoryStore(state => state.allCategories);
  const fetchAllCategories = useCategoryStore(state => state.fetchAllCategories);

  const category = useMemo(
    () => allCategories.find(c => c.id === (categoryId as string)),
    [allCategories, categoryId]
  );

  const subcategories = useMemo(
    () => allCategories.filter(c => c.parent_id === (categoryId as string)),
    [allCategories, categoryId]
  );

  return { category, subcategories, fetchAllCategories };
}
