import { supabase } from '@/lib/services/supabase';
import { Product } from '@/types';

/**
 * Получение списка ID избранных товаров пользователя
 */
export async function fetchFavoriteIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select('product_id')
    .eq('user_id', userId);

  if (error) throw error;
  return data?.map(f => f.product_id) || [];
}

/**
 * Добавление товара в избранное
 */
export async function addToFavorites(userId: string, productId: string): Promise<void> {
  const { error } = await supabase
    .from('favorites')
    .insert({ user_id: userId, product_id: productId });

  if (error) throw error;
}

/**
 * Удаление товара из избранного
 */
export async function removeFromFavorites(userId: string, productId: string): Promise<void> {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);

  if (error) throw error;
}

/**
 * Получение товаров по массиву ID (для экрана избранного)
 */
export async function fetchFavoriteProducts(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .in('id', ids)
    .eq('is_active', true);

  if (error) throw error;
  return data || [];
}
