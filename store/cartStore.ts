import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '@/types';

type CartItem = {
  product: Product;
  quantity: number;
};

interface CartState {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  totalPrice: number;
  totalItems: number;
  isLoading: boolean;
  error: string | null;
  addItem: (product: Product) => void;
  addItemsBatch: (newItemsList: { product: Product; quantity: number }[]) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  clearError: () => void;
}

const DELIVERY_THRESHOLD = 700;
const DELIVERY_FEE = 90;

// Вспомогательная функция для пересчёта после любого изменения состояния
const calculateTotals = (items: CartItem[]) => {
  const subtotal = items.reduce((total, item) => total + (Number(item.product.price) || 0) * item.quantity, 0);
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  
  let deliveryFee = 0;

  if (totalItems > 0) {
    deliveryFee = subtotal >= DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  }

  const totalPrice = subtotal + deliveryFee;

  return { subtotal, deliveryFee, totalPrice, totalItems };
};

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
          return { items: newItems, ...calculateTotals(newItems) };
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

          return { items: currentItems, ...calculateTotals(currentItems) };
        });
      },

      removeItem: (productId) => {
        set((state) => {
          const newItems = state.items.filter((item) => item.product.id !== productId);
          return { items: newItems, ...calculateTotals(newItems) };
        });
      },

      updateQuantity: (productId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            const newItems = state.items.filter((item) => item.product.id !== productId);
            return { items: newItems, ...calculateTotals(newItems) };
          }
          const newItems = state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          );
          return { items: newItems, ...calculateTotals(newItems) };
        });
      },

      clearCart: () => set({ 
        items: [], 
        subtotal: 0, 
        deliveryFee: 0, 
        totalPrice: 0, 
        totalItems: 0, 
        error: null, 
        isLoading: false 
      }),
    }),
    {
      name: 'grocery-cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
