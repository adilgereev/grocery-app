import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/services/supabase';
import { useToastStore } from '@/store/toastStore';
import { CartState, calculateTotals } from '@/lib/utils/cartUtils';

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      subtotal: 0,
      deliveryFee: 0,
      totalPrice: 0,
      totalItems: 0,
      isLoading: false,
      error: null,
      promoCode: null,
      discount: 0,
      promoError: null,
      isValidatingPromo: false,

      clearError: () => {
        set({ error: null, isLoading: false });
      },

      addItem: (product) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.product.id === product.id);
          let newItems;
          if (existingItem) {
            newItems = state.items.map((item) =>
              item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            );
          } else {
            newItems = [...state.items, { product, quantity: 1 }];
          }
          return { items: newItems, ...calculateTotals(newItems, state.discount) };
        });
      },

      addItemsBatch: (newItemsList) => {
        set((state) => {
          let currentItems = [...state.items];

          newItemsList.forEach((incomingItem) => {
            const existingItemIndex = currentItems.findIndex((item) => item.product.id === incomingItem.product.id);
            if (existingItemIndex >= 0) {
              currentItems[existingItemIndex] = {
                ...currentItems[existingItemIndex],
                quantity: currentItems[existingItemIndex].quantity + incomingItem.quantity
              };
            } else {
              currentItems.push({ product: incomingItem.product, quantity: incomingItem.quantity });
            }
          });

          return { items: currentItems, ...calculateTotals(currentItems, state.discount) };
        });
      },

      removeItem: (productId) => {
        set((state) => {
          const newItems = state.items.filter((item) => item.product.id !== productId);
          return { items: newItems, ...calculateTotals(newItems, state.discount) };
        });
      },

      updateQuantity: (productId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            const newItems = state.items.filter((item) => item.product.id !== productId);
            return { items: newItems, ...calculateTotals(newItems, state.discount) };
          }
          const newItems = state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          );
          return { items: newItems, ...calculateTotals(newItems, state.discount) };
        });
      },

      clearCart: () => set({
        items: [],
        subtotal: 0,
        deliveryFee: 0,
        totalPrice: 0,
        totalItems: 0,
        error: null,
        isLoading: false,
        promoCode: null,
        discount: 0,
        promoError: null,
        isValidatingPromo: false,
      }),

      applyPromoCode: async (code: string) => {
        const { subtotal } = get();
        set({ isValidatingPromo: true, promoError: null });

        try {
          const { data, error } = await supabase
            .from('promo_codes')
            .select('discount_type, discount_value, min_order_amount, max_uses, used_count, expires_at')
            .eq('code', code.toUpperCase())
            .eq('is_active', true)
            .maybeSingle();

          if (error || !data) {
            set({ isValidatingPromo: false, promoError: 'Промокод не найден или неактивен' });
            return;
          }

          if (data.expires_at && new Date(data.expires_at) < new Date()) {
            set({ isValidatingPromo: false, promoError: 'Срок действия промокода истёк' });
            return;
          }

          if (data.max_uses !== null && (data.used_count ?? 0) >= data.max_uses) {
            set({ isValidatingPromo: false, promoError: 'Промокод уже исчерпан' });
            return;
          }

          const minOrder = Number(data.min_order_amount) || 0;
          if (subtotal < minOrder) {
            set({ isValidatingPromo: false, promoError: `Минимальная сумма заказа: ${minOrder} ₽` });
            return;
          }

          const discount =
            data.discount_type === 'percent'
              ? Math.round(subtotal * Number(data.discount_value) / 100)
              : Number(data.discount_value);

          const items = get().items;
          set({
            isValidatingPromo: false,
            promoCode: code.toUpperCase(),
            discount,
            promoError: null,
            ...calculateTotals(items, discount),
          });
        } catch {
          set({ isValidatingPromo: false, promoError: 'Ошибка проверки промокода' });
        }
      },

      removePromoCode: () => {
        const items = get().items;
        set({
          promoCode: null,
          discount: 0,
          promoError: null,
          ...calculateTotals(items, 0),
        });
      },

      revalidatePromoCode: async () => {
        const { promoCode, removePromoCode } = get();
        if (!promoCode) return;

        try {
          const { data } = await supabase
            .from('promo_codes')
            .select('is_active, expires_at, max_uses, used_count')
            .eq('code', promoCode)
            .maybeSingle();

          const isExpired = data?.expires_at && new Date(data.expires_at) < new Date();
          const isExhausted = data?.max_uses != null && (data?.used_count ?? 0) >= data.max_uses;
          const isInvalid = !data || !data.is_active || isExpired || isExhausted;

          if (isInvalid) {
            removePromoCode();
            useToastStore.getState().showToast('warning', 'Промокод больше не действует');
          }
        } catch {
          // тихая ошибка — не блокируем запуск приложения
        }
      },
    }),
    {
      name: 'grocery-cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        items: state.items,
        subtotal: state.subtotal,
        deliveryFee: state.deliveryFee,
        totalPrice: state.totalPrice,
        totalItems: state.totalItems,
        discount: state.discount,
        promoCode: state.promoCode,
      }),
    }
  )
);
