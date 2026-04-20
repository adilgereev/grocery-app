import { supabase } from '@/lib/services/supabase';
import { Order, OrderStatusHistory } from '@/types';

interface OrderWithItems {
  order: Order;
  items: OrderItem[];
  history: OrderStatusHistory[];
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
export async function createOrder(
  userId: string,
  totalAmount: number,
  address: string,
  paymentMethod: 'online' | 'cash',
  comment?: string,
  promoCode?: string | null,
  discountAmount?: number,
): Promise<Order> {
  if (discountAmount && discountAmount > totalAmount) {
    throw new Error('Скидка превышает сумму заказа');
  }

  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      total_amount: totalAmount,
      delivery_address: address,
      status: 'pending' as const,
      payment_method: paymentMethod,
      comment: comment?.trim() || null,
      promo_code: promoCode ?? null,
      discount_amount: discountAmount ?? 0,
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

export async function fetchOrderDetails(orderId: string): Promise<OrderWithItems> {
  const [orderQuery, itemsQuery] = await Promise.all([
    supabase
      .from('orders')
      .select('*, history:order_status_history(*)')
      .eq('id', orderId)
      .single(),
    supabase.from('order_items').select('*, product:product_id(*)').eq('order_id', orderId),
  ]);

  if (orderQuery.error) throw orderQuery.error;
  if (itemsQuery.error) throw itemsQuery.error;

  const { history, ...order } = orderQuery.data as any;
  const sortedHistory = ((history as OrderStatusHistory[]) || [])
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  return {
    order: order as Order,
    items: itemsQuery.data || [],
    history: sortedHistory,
  };
}
