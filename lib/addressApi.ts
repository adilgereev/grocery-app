import { supabase } from './supabase';
import { Address } from '@/store/addressStore';

/**
 * Получение списка адресов пользователя
 */
export async function fetchAddresses(userId: string): Promise<Address[]> {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Address[];
}

/**
 * Добавление нового адреса
 */
export async function createAddress(userId: string, details: Omit<Address, 'id'>): Promise<Address> {
  const { data, error } = await supabase
    .from('addresses')
    .insert({
      user_id: userId,
      ...details
    })
    .select()
    .single();

  if (error) throw error;
  return data as Address;
}

/**
 * Обновление существующего адреса
 */
export async function updateAddress(userId: string, id: string, details: Partial<Address>): Promise<Address> {
  const { data, error } = await supabase
    .from('addresses')
    .update(details)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as Address;
}

/**
 * Удаление адреса с проверкой принадлежности пользователю
 */
export async function deleteAddress(userId: string, id: string): Promise<void> {
  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
}

/**
 * Установка адреса как выбранного (в БД через 2 этапа)
 */
export async function markAddressAsSelected(userId: string, id: string): Promise<void> {
  const { error } = await supabase.rpc('select_delivery_address', {
    p_user_id: userId,
    p_address_id: id,
  });

  if (error) throw error;
}
