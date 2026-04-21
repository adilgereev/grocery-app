import { supabase } from '@/lib/supabase';
import type { Order } from '@/types';

export interface ReplacementSuggestion {
  id: string;
  name: string;
  unit: string;
  image_url: string | null;
  price: number;
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
    .neq('id', excludeProductId)
    .limit(20);

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
