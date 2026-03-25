import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface Address {
  id: string; // uuid from supabase
  text: string;
  house?: string;
  entrance?: string;
  floor?: string;
  intercom?: string;
  apartment?: string;
  is_selected: boolean;
}

interface AddressStore {
  addresses: Address[];
  selectedAddressId: string | null;
  isLoading: boolean;
  error: string | null;
  addAddress: (details: { text: string, house?: string, entrance?: string, floor?: string, intercom?: string, apartment?: string }) => Promise<void>;
  removeAddress: (id: string) => Promise<void>;
  selectAddress: (id: string) => Promise<void>;
  loadAddresses: () => Promise<void>;
  clearAddresses: () => void;
  clearError: () => void;
  setError: (error: string | null) => void;
}

export const useAddressStore = create<AddressStore>((set, get) => ({
  addresses: [],
  selectedAddressId: null,
  isLoading: false,
  error: null,

  clearError: () => {
    set({ error: null, isLoading: false });
  },

  setError: (error: string | null) => {
    set({ error, isLoading: !!error });
  },

  clearAddresses: () => {
    set({ addresses: [], selectedAddressId: null, error: null, isLoading: false });
  },

  loadAddresses: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const selected = data.find(a => a.is_selected);
      // Если выбранного нет, сделаем первый локально активным
      const fallbackId = data.length > 0 ? data[0].id : null;

      set({
        addresses: data as Address[],
        selectedAddressId: selected ? selected.id : fallbackId
      });
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Не удалось загрузить адреса';
      console.error('Ошибка загрузки адресов:', e);
      set({ error: errorMessage });
    }
  },

  addAddress: async (details) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Если это первый адрес для пользователя, то сделаем его сразу "Выбранным" автоматически
      const isFirst = get().addresses.length === 0;

      const { data, error } = await supabase
        .from('addresses')
        .insert({
          user_id: session.user.id,
          text: details.text,
          house: details.house,
          entrance: details.entrance,
          floor: details.floor,
          intercom: details.intercom,
          apartment: details.apartment,
          is_selected: isFirst
        })
        .select()
        .single();

      if (error) throw error;

      const updated = [data as Address, ...get().addresses];
      set({
        addresses: updated,
        selectedAddressId: isFirst ? data.id : get().selectedAddressId
      });
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Не удалось добавить адрес';
      console.error('Ошибка добавления адреса:', e);
      set({ error: errorMessage });
    }
  },

  removeAddress: async (id) => {
    try {
      // Ожидаем успешного удаления в Supabase
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Обновляем UI локально
      const updated = get().addresses.filter(a => a.id !== id);
      set({ addresses: updated });

      // Если мы удалили текущий выбранный адрес, переключаем выборку на следующий доступный
      if (get().selectedAddressId === id) {
        const nextId = updated.length > 0 ? updated[0].id : null;
        if (nextId) {
          await get().selectAddress(nextId);
        } else {
          set({ selectedAddressId: null });
        }
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Не удалось удалить адрес';
      console.error('Ошибка удаления адреса:', e);
      set({ error: errorMessage });
    }
  },

  selectAddress: async (id) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Быстрое локальное обновление стейта
      set({ selectedAddressId: id });

      // На бэкенде в 2 этапа: снимаем флажок у всех адресов этого пользователя
      await supabase
        .from('addresses')
        .update({ is_selected: false })
        .eq('user_id', session.user.id);

      // Ставим флажок "Выбрано" (is_selected = true) на тот адрес, который мы кликнули
      await supabase
        .from('addresses')
        .update({ is_selected: true })
        .eq('id', id);
        
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Не удалось выбрать адрес';
      console.error('Ошибка выбора адреса:', e);
      set({ error: errorMessage });
    }
  }
}));
