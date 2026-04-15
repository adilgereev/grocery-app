import { create } from 'zustand';
import { supabase } from '@/lib/services/supabase';
import { fetchAddresses, createAddress, updateAddress, deleteAddress, markAddressAsSelected } from '@/lib/api/addressApi';
import { getSession } from '@/lib/api/authApi';
import { logger } from '@/lib/utils/logger';
import { Address } from '@/types';


interface AddressStore {
  addresses: Address[];
  selectedAddressId: string | null;
  isLoading: boolean;
  error: string | null;
  addAddress: (details: {
    text: string,
    house?: string,
    entrance?: string,
    floor?: string,
    intercom?: string,
    apartment?: string,
    lat?: number,
    lon?: number
  }) => Promise<void>;
  updateAddress: (id: string, details: {
    text: string,
    house?: string,
    entrance?: string,
    floor?: string,
    intercom?: string,
    apartment?: string,
    lat?: number,
    lon?: number
  }) => Promise<void>;
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
      const session = await getSession();
      if (!session) return;

      const data = await fetchAddresses(session.user.id);

      const selected = data.find(a => a.is_selected);
      // Если выбранного нет, сделаем первый локально активным
      const fallbackId = data.length > 0 ? data[0].id : null;

      set({
        addresses: data as Address[],
        selectedAddressId: selected ? selected.id : fallbackId
      });
    } catch (e) {
      logger.error('Ошибка загрузки адресов:', e);
      set({ error: e instanceof Error ? e.message : 'Не удалось загрузить адреса', isLoading: false });
    }
  },

  addAddress: async (details) => {
    try {
      const session = await getSession();
      if (!session) return;

      // Если это первый адрес для пользователя, то сделаем его сразу "Выбранным" автоматически
      const isFirst = get().addresses.length === 0;

      const data = await createAddress(session.user.id, {
        text: details.text,
        house: details.house,
        entrance: details.entrance,
        floor: details.floor,
        intercom: details.intercom,
        apartment: details.apartment,
        lat: details.lat,
        lon: details.lon,
        is_selected: isFirst
      });

      const updated = [data as Address, ...get().addresses];
      set({
        addresses: updated,
        selectedAddressId: isFirst ? data.id : get().selectedAddressId
      });
    } catch (e) {
      logger.error('Ошибка добавления адреса:', e);
      set({ error: e instanceof Error ? e.message : 'Не удалось добавить адрес', isLoading: false });
      throw e;
    }
  },

  updateAddress: async (id, details) => {
    try {
      const session = await getSession();
      if (!session) return;

      const data = await updateAddress(session.user.id, id, {
        text: details.text,
        house: details.house,
        entrance: details.entrance,
        floor: details.floor,
        intercom: details.intercom,
        apartment: details.apartment,
        lat: details.lat,
        lon: details.lon,
      });

      const updated = get().addresses.map((a) => (a.id === id ? { ...a, ...data } : a));
      set({ addresses: updated as Address[] });
    } catch (e) {
      logger.error('Ошибка обновления адреса:', e);
      set({ error: e instanceof Error ? e.message : 'Не удалось обновить адрес', isLoading: false });
      throw e;
    }
  },

  removeAddress: async (id) => {
    try {
      const session = await getSession();
      if (!session) return;

      await deleteAddress(session.user.id, id);

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
    } catch (e) {
      logger.error('Ошибка удаления адреса:', e);
      set({ error: e instanceof Error ? e.message : 'Не удалось удалить адрес', isLoading: false });
    }
  },

  selectAddress: async (id) => {
    try {
      const session = await getSession();
      if (!session) return;

      // Быстрое локальное обновление стейта
      const updatedAddresses = get().addresses.map(a => ({
        ...a,
        is_selected: a.id === id
      }));
      set({ 
        selectedAddressId: id,
        addresses: updatedAddresses
      });

      // На бэкенде: обновляем выбранный адрес через API
      await markAddressAsSelected(session.user.id, id);
        
    } catch (e) {
      logger.error('Ошибка выбора адреса:', e);
      set({ error: e instanceof Error ? e.message : 'Не удалось выбрать адрес' });
    }
  }
}));
