import { supabase } from '@/lib/services/supabase';
import { StaffMember } from '@/types';

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

export async function completeCourierDelivery(
  orderId: string,
  staffId: string,
): Promise<void> {
  const { error } = await supabase.rpc('complete_courier_delivery', {
    p_order_id: orderId,
    p_staff_id: staffId,
  });
  if (error) throw error;
}

export async function takeOrderPicker(orderId: string, staffId: string): Promise<void> {
  const { error } = await supabase.rpc('take_order_picker', { p_order_id: orderId, p_staff_id: staffId });
  if (error) throw error;
}

export async function completePickerAssembly(orderId: string, staffId: string): Promise<void> {
  const { error } = await supabase.rpc('complete_picker_assembly', { p_order_id: orderId, p_staff_id: staffId });
  if (error) throw error;
}

export async function takeOrderCourier(orderId: string, staffId: string): Promise<void> {
  const { error } = await supabase.rpc('take_order_courier', { p_order_id: orderId, p_staff_id: staffId });
  if (error) throw error;
}
