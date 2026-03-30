import { supabase } from './supabase';
import { Category, CategoryWithHierarchy, CategoryWithSubcategories } from '@/types';

/**
 * Получение всех корневых категорий (родительские категории без parent_id)
 * Оптимизировано через индекс idx_categories_root
 */
export async function fetchRootCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .is('parent_id', null)
    .order('sort_order', { ascending: true });

  if (error) throw new Error(`Не удалось загрузить корневые категории: ${error.message}`);
  return data || [];
}

/**
 * Получение подкатегорий по parent_id
 * Использует индекс idx_categories_parent_id
 */
async function fetchSubcategories(parentId: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('parent_id', parentId)
    .order('sort_order', { ascending: true });

  if (error) throw new Error(`Не удалось загрузить подкатегории: ${error.message}`);
  return data || [];
}


/**
 * Получение всех категорий с иерархией (через view categories_with_hierarchy)
 */
export async function fetchCategoriesWithHierarchy(): Promise<CategoryWithHierarchy[]> {
  const { data, error } = await supabase
    .from('categories_with_hierarchy')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw new Error(`Не удалось загрузить категории с иерархией: ${error.message}`);
  return (data as unknown) as CategoryWithHierarchy[];
}

/**
 * Получение всех корневых категорий с их подкатегориями
 * Оптимизировано для домашней страницы
 */
export async function fetchFullHierarchy(): Promise<CategoryWithSubcategories[]> {
  // Получаем корневые категории
  const rootCategories = await fetchRootCategories();
  
  if (!rootCategories || rootCategories.length === 0) {
    console.log('[CategoriesApi] No root categories found');
    return [];
  }

  // Для каждой корневой категории загружаем её подкатегории защищенным способом
  const categoriesWithSubs = await Promise.all(
    rootCategories.map(async (root) => {
      try {
        const subcategories = await fetchSubcategories(root.id);
        return {
          ...root,
          subcategories
        };
      } catch (err) {
        console.error(`[CategoriesApi] Failed to load subcategories for ${root.name}:`, err);
        // Возвращаем корень без подкатегорий, чтобы не ломать всё дерево
        return {
          ...root,
          subcategories: []
        };
      }
    })
  );

  return categoriesWithSubs;
}
