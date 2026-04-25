import { supabase } from '@/lib/supabase';
import type { Category } from '@/types';

export async function fetchAllCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data || []) as Category[];
}

export async function createCategory(categoryData: {
  name: string;
  slug: string;
  image_url?: string | null;
  parent_id?: string | null;
  sort_order: number;
  is_active?: boolean;
}): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .insert(categoryData);

  if (error) throw error;
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .update(data)
    .eq('id', id);

  if (error) throw error;
}

export async function deleteCategory(id: string, allRelatedIds: string[]): Promise<void> {
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
