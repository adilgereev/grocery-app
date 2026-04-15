import { supabase } from '@/lib/services/supabase';
import { Category, Order, ProductWithCategory } from '@/types';

/**
 * Сервисный слой для административных операций.
 * Изолирует прямые Supabase-вызовы от экранов admin-панели.
 */

// ─── Категории ───────────────────────────────────────────────

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

// ─── Продукты (admin) ────────────────────────────────────────

/**
 * Получение всех товаров с именем категории (для каталога админки)
 */
export async function fetchAllProductsWithCategory(): Promise<ProductWithCategory[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:category_id(name)')
    .order('id', { ascending: false });

  if (error) throw error;
  return (data || []) as ProductWithCategory[];
}

/**
 * Получение товара для редактирования (без фильтра is_active)
 */
export async function fetchProductForEdit(id: string): Promise<ProductWithCategory | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as ProductWithCategory | null;
}

/**
 * Создание нового товара
 */
export async function createProduct(productData: {
  name: string;
  description?: string;
  price: number;
  unit: string;
  image_url?: string;
  category_id: string;
  is_active?: boolean;
  stock?: number;
  tags?: string[];
}): Promise<void> {
  const { error } = await supabase
    .from('products')
    .insert(productData);

  if (error) throw error;
}

/**
 * Обновление существующего товара
 */
export async function updateProduct(id: string, data: Record<string, unknown>): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update(data)
    .eq('id', id);

  if (error) throw error;
}

/**
 * Удаление товара
 */
export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ─── Заказы (admin) ──────────────────────────────────────────

/**
 * Тип заказа с данными клиента и позициями (для admin-экрана)
 */
export interface AdminOrderItem {
  id: string;
  quantity: number;
  price_at_time: number;
  product?: { name: string } | null;
}

export interface AdminOrderWithDetails {
  id: string;
  status: Order['status'];
  total_amount: number;
  delivery_address: string;
  comment: string | null;
  created_at: string;
  profiles: { first_name: string | null; last_name: string | null; phone: string }
    | { first_name: string | null; last_name: string | null; phone: string }[];
  items?: AdminOrderItem[];
}

/**
 * Получение всех заказов с данными клиентов и позициями (для admin)
 */
export async function fetchAllOrdersWithDetails(): Promise<AdminOrderWithDetails[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, profiles:user_id (first_name, last_name, phone), items:order_items(*, product:products(*))')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as AdminOrderWithDetails[];
}

/**
 * Обновление статуса заказа (admin)
 */
export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) throw error;
}
