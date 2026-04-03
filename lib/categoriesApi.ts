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
 * Получение всех категорий одним запросом и сборка иерархии в памяти.
 * Высокая производительность: всего 1 сетевой запрос вместо N+1.
 */
export async function fetchFullHierarchy(): Promise<CategoryWithSubcategories[]> {
  // Забираем вообще все категории одним махом
  const { data: allCategories, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .setHeader('Cache-Control', 'no-cache');

  if (error) {
    throw new Error(`Не удалось загрузить все категории: ${error.message}`);
  }

  if (!allCategories || allCategories.length === 0) {
    return [];
  }

  // 1. Фильтруем корневые (у которых нет parent_id)
  const roots = allCategories.filter(cat => cat.parent_id === null);

  // 2. Для каждого корня собираем его подкатегории
  const hierarchy: CategoryWithSubcategories[] = roots.map(root => {
    const subcategories = allCategories.filter(cat => cat.parent_id === root.id);
    return {
      ...root,
      subcategories
    };
  });

  return hierarchy;
}
