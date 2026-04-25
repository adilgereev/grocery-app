import { supabase } from '@/lib/services/supabase';
import { Order } from '@/types';

const ORDER_DETAILS_SELECT = '*, profiles:user_id(first_name, phone), items:order_items(*, product:products(id, name, unit, image_url, category_id, price)), assignments:staff_assignments(staff_type, staff_id, status, staff:profiles!staff_assignments_staff_id_fkey(first_name, phone))';

export interface AdminOrderItem {
  id: string;
  quantity: number;
  price_at_time: number;
  product?: {
    id: string;
    name: string;
    unit: string;
    image_url: string | null;
    category_id: string | null;
    price: number;
  } | null;
}

export interface AdminOrderAssignment {
  staff_type: 'picker' | 'courier';
  staff_id: string;
  status: 'active' | 'completed' | 'cancelled';
  staff?: { first_name: string | null; phone: string } | null;
}

export interface AdminOrderWithDetails {
  id: string;
  status: Order['status'];
  total_amount: number;
  delivery_address: string;
  comment: string | null;
  created_at: string;
  profiles: { first_name: string | null; phone: string }
    | { first_name: string | null; phone: string }[];
  items?: AdminOrderItem[];
  assignments?: AdminOrderAssignment[];
}

export interface ReplacementSuggestion {
  id: string;
  name: string;
  unit: string;
  image_url: string | null;
  price: number;
}

export async function fetchAllOrdersWithDetails(statusFilter?: readonly Order['status'][]): Promise<AdminOrderWithDetails[]> {
  let query = supabase
    .from('orders')
    .select(ORDER_DETAILS_SELECT)
    .order('created_at', { ascending: false });

  if (statusFilter && statusFilter.length > 0) {
    query = query.in('status', statusFilter);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as AdminOrderWithDetails[];
}

export async function fetchStaffHistoryOrders(
  staffId: string,
  staffType: 'picker' | 'courier',
): Promise<AdminOrderWithDetails[]> {
  const { data: assignments, error: aErr } = await supabase
    .from('staff_assignments')
    .select('order_id')
    .eq('staff_id', staffId)
    .eq('staff_type', staffType);

  if (aErr) throw aErr;
  const orderIds = (assignments || []).map((a: { order_id: string }) => a.order_id);
  if (orderIds.length === 0) return [];

  const historicalStatuses = ['delivered', 'cancelled'] as const;

  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_DETAILS_SELECT)
    .in('id', orderIds)
    .in('status', historicalStatuses)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as AdminOrderWithDetails[];
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) throw error;
}

export async function fetchPendingOrdersCount(): Promise<number> {
  const { count, error } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .in('status', ['pending', 'processing', 'assembled', 'shipped']);

  if (error) throw error;
  return count ?? 0;
}

export async function fetchReplacementSuggestions(
  categoryId: string,
  excludeProductId: string,
  originalPrice: number,
): Promise<ReplacementSuggestion[]> {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, unit, image_url, price')
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .neq('id', excludeProductId);

  if (error) throw error;

  return (data || [])
    .sort((a, b) => Math.abs(a.price - originalPrice) - Math.abs(b.price - originalPrice))
    .slice(0, 5) as ReplacementSuggestion[];
}

export async function replaceOrderItem(params: {
  itemId: string;
  orderId: string;
  newProductId: string;
  newPrice: number;
  newTotal: number;
  originalProductName: string;
  newProductName: string;
  currentStatus: Order['status'];
  adminId: string;
}): Promise<void> {
  const { error } = await supabase.rpc('replace_order_item', {
    p_item_id: params.itemId,
    p_order_id: params.orderId,
    p_new_product_id: params.newProductId,
    p_new_price: params.newPrice,
    p_new_total: params.newTotal,
    p_original_product_name: params.originalProductName,
    p_new_product_name: params.newProductName,
    p_current_status: params.currentStatus,
    p_admin_id: params.adminId,
  });
  if (error) throw error;
}

export async function deleteOrderItem(params: {
  itemId: string;
  orderId: string;
  productName: string;
  newTotal: number;
  currentStatus: Order['status'];
  adminId: string;
}): Promise<void> {
  const { error } = await supabase.rpc('delete_order_item', {
    p_item_id: params.itemId,
    p_order_id: params.orderId,
    p_product_name: params.productName,
    p_new_total: params.newTotal,
    p_current_status: params.currentStatus,
    p_admin_id: params.adminId,
  });
  if (error) throw error;
}
