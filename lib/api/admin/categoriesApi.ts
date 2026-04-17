import { supabase } from '@/lib/services/supabase';
import { Category } from '@/types';

/**
 * Получение всех категорий (для админки)
 */
export async function fetchAllCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data || []) as Category[];
}

/**
 * Создание новой категории
 */
export async function createCategory(categoryData: {
  name: string;
  slug: string;
  image_url?: string | null;
  parent_id?: string | null;
  sort_order: number;
}): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .insert(categoryData);

  if (error) throw error;
}

/**
 * Обновление существующей категории
 */
export async function updateCategory(id: string, data: Partial<Category>): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .update(data)
    .eq('id', id);

  if (error) throw error;
}

/**
 * Удаление категории и отвязка товаров от неё и её дочерних категорий
 */
export async function deleteCategory(id: string, allRelatedIds: string[]): Promise<void> {
  // Отвязываем товары от всех связанных категорий
  await supabase
    .from('products')
    .update({ category_id: null })
    .in('category_id', allRelatedIds);

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Массовое обновление sort_order категорий (для метода Shift)
 */
export async function updateCategorySortOrders(
  updates: { id: string; sort_order: number }[]
): Promise<void> {
  const promises = updates.map((update) =>
    supabase.from('categories').update({ sort_order: update.sort_order }).eq('id', update.id)
  );

  const results = await Promise.all(promises);
  const hasError = results.some((res) => res.error);
  if (hasError) {
    throw new Error('Ошибка при обновлении порядка сортировки категорий');
  }
}
