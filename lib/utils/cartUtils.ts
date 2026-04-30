import { Product } from '@/types';

export type CartItem = {
  product: Product;
  quantity: number;
};

export interface CartState {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  totalPrice: number;
  totalItems: number;
  isLoading: boolean;
  error: string | null;
  promoCode: string | null;
  discount: number;
  promoError: string | null;
  isValidatingPromo: boolean;
  addItem: (product: Product) => void;
  addItemsBatch: (newItemsList: { product: Product; quantity: number }[]) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  clearError: () => void;
  applyPromoCode: (code: string) => Promise<void>;
  removePromoCode: () => void;
  revalidatePromoCode: () => Promise<void>;
}

const DELIVERY_THRESHOLD = 700;
const DELIVERY_FEE = 90;

export const calculateTotals = (items: CartItem[], discount: number = 0) => {
  const subtotal = items.reduce((total, item) => total + (Number(item.product.price) || 0) * item.quantity, 0);
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  let deliveryFee = 0;
  if (totalItems > 0) {
    deliveryFee = subtotal >= DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  }

  const totalPrice = Math.max(0, subtotal + deliveryFee - discount);

  return { subtotal, deliveryFee, totalPrice, totalItems };
};
