import { supabase } from '@/lib/services/supabase';
import { Product } from '@/types';

/**
 * Поиск товаров по названию
 */
export async function searchProducts(query: string, limit: number = 30): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .ilike('name', `%${query}%`)
    .eq('is_active', true)
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Получение товара по ID
 */
export async function fetchProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Получение товаров по ID подкатегории
 */
export async function fetchProductsByCategoryId(categoryId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Получение похожих товаров (из той же категории, исключая текущий)
 */
export async function fetchRelatedProducts(categoryId: string, excludeId: string, limit: number = 6): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', categoryId)
    .neq('id', excludeId)
    .eq('is_active', true)
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Получение популярных товаров
 */
export async function fetchPopularProducts(limit: number = 10): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit * 3);

  if (error) throw error;
  const all = data || [];
  return all.sort(() => Math.random() - 0.5).slice(0, limit);
}
