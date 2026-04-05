import { supabase } from './supabase';
import { Order } from '@/types';

/**
 * Тип заказа с его позициями для экрана деталей
 */
export interface OrderWithItems {
  order: Order;
  items: OrderItem[];
}

/**
 * Позиция заказа с данными продукта
 */
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_time: number;
  product?: {
    id: string;
    name: string;
    image_url: string | null;
    unit: string;
  } | null;
}

/**
 * Создание нового заказа
 */
export async function createOrder(userId: string, totalAmount: number, address: string, paymentMethod: 'online' | 'cash'): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      total_amount: totalAmount,
      delivery_address: address,
      status: 'pending' as const,
      payment_method: paymentMethod,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Order;
}

/**
 * Создание позиций заказа
 */
export async function createOrderItems(items: { order_id: string, product_id: string, quantity: number, price_at_time: number }[]): Promise<void> {
  const { error } = await supabase
    .from('order_items')
    .insert(items);

  if (error) throw error;
}

/**
 * Получение истории заказов пользователя
 */
export async function fetchOrders(userId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Order[];
}

/**
 * Получение деталей заказа и его позиций
 */
export async function fetchOrderDetails(orderId: string): Promise<OrderWithItems> {
  const [orderQuery, itemsQuery] = await Promise.all([
    supabase.from('orders').select('*').eq('id', orderId).single(),
    supabase.from('order_items').select('*, product:product_id(*)').eq('order_id', orderId)
  ]);

  if (orderQuery.error) throw orderQuery.error;
  if (itemsQuery.error) throw itemsQuery.error;

  return {
    order: orderQuery.data,
    items: itemsQuery.data || []
  };
}
