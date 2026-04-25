import { supabase } from '@/lib/supabase';
import type { Order } from '@/types';

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

export interface StaffMember {
  id: string;
  first_name: string | null;
  phone: string;
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

export async function fetchAllOrdersWithDetails(): Promise<AdminOrderWithDetails[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, profiles:user_id(first_name, phone), items:order_items(*, product:products(id, name, unit, image_url, category_id, price)), assignments:staff_assignments(staff_type, staff_id, status, staff:profiles!staff_assignments_staff_id_fkey(first_name, phone))')
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

export async function fetchStaffByType(type: 'picker' | 'courier'): Promise<StaffMember[]> {
  const column = type === 'picker' ? 'is_picker' : 'is_courier';
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, phone')
    .eq(column, true);

  if (error) throw error;
  return (data || []) as StaffMember[];
}

export async function assignStaff(
  orderId: string,
  staffType: 'picker' | 'courier',
  staffId: string,
): Promise<void> {
  const { error } = await supabase
    .from('staff_assignments')
    .upsert(
      { order_id: orderId, staff_type: staffType, staff_id: staffId, status: 'active' },
      { onConflict: 'order_id,staff_type' },
    );

  if (error) throw error;
}

export async function unassignStaff(
  orderId: string,
  staffType: 'picker' | 'courier',
): Promise<void> {
  const { error } = await supabase
    .from('staff_assignments')
    .update({ status: 'cancelled' })
    .eq('order_id', orderId)
    .eq('staff_type', staffType)
    .eq('status', 'active');

  if (error) throw error;
}
