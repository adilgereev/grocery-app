import { supabase } from '@/lib/services/supabase';
import { Order } from '@/types';

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

/**
 * Количество заказов со статусом 'pending' (для бейджа на дашборде)
 */
export async function fetchPendingOrdersCount(): Promise<number> {
  const { count, error } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .in('status', ['pending', 'processing', 'shipped']);

  if (error) throw error;
  return count ?? 0;
}
