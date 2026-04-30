import { useCheckout } from '@/hooks/domain/useCheckout';
import { useCartStore } from '@/store/cartStore';
import { Product } from '@/types';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function useCart() {
  const items = useCartStore(state => state.items);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const removeItem = useCartStore(state => state.removeItem);
  const addItem = useCartStore(state => state.addItem);
  const clearCart = useCartStore(state => state.clearCart);
  const subtotal = useCartStore(state => state.subtotal);
  const deliveryFee = useCartStore(state => state.deliveryFee);
  const totalPrice = useCartStore(state => state.totalPrice);

  const { top: insetsTop } = useSafeAreaInsets();
  const { navigateToCheckout } = useCheckout();
  const router = useRouter();

  const [pendingRemoval, setPendingRemoval] = useState<{
    item: { product: Product; quantity: number };
    timerId: ReturnType<typeof setTimeout>;
  } | null>(null);

  // Отмена таймера при размонтировании — предотвращает stale setState
  const pendingRemovalRef = useRef(pendingRemoval);
  pendingRemovalRef.current = pendingRemoval;
  useEffect(() => {
    return () => {
      if (pendingRemovalRef.current) {
        clearTimeout(pendingRemovalRef.current.timerId);
      }
    };
  }, []);

  const handleProductPress = useCallback((productId: string, productName: string) => {
    router.push(`/product/${productId}?name=${encodeURIComponent(productName)}`);
  }, [router]);

  const handleGoShopping = useCallback(() => {
    router.push('/(tabs)/(index)');
  }, [router]);

  // qty=0 → удаление с возможностью отмены через 4 сек
  const handleQuantityUpdate = useCallback((productId: string, quantity: number) => {
    if (quantity > 0) {
      updateQuantity(productId, quantity);
      return;
    }
    const item = items.find(i => i.product.id === productId);
    if (!item) return;

    if (pendingRemoval) {
      clearTimeout(pendingRemoval.timerId);
    }

    removeItem(productId);
    const timerId = setTimeout(() => setPendingRemoval(null), 4000);
    setPendingRemoval({ item, timerId });
  }, [items, updateQuantity, removeItem, pendingRemoval]);

  const handleUndo = useCallback(() => {
    if (!pendingRemoval) return;
    clearTimeout(pendingRemoval.timerId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addItem(pendingRemoval.item.product);
    setPendingRemoval(null);
  }, [pendingRemoval, addItem]);

  const handleClearCart = useCallback(() => {
    Alert.alert(
      'Очистить корзину',
      'Удалить все товары из корзины?',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Очистить', style: 'destructive', onPress: () => {
          if (pendingRemoval) {
            clearTimeout(pendingRemoval.timerId);
            setPendingRemoval(null);
          }
          clearCart();
        }},
      ]
    );
  }, [pendingRemoval, clearCart]);

  const handleUndoDismiss = useCallback(() => {
    if (!pendingRemoval) return;
    clearTimeout(pendingRemoval.timerId);
    setPendingRemoval(null);
  }, [pendingRemoval]);

  const showEmptyCart = items.length === 0 && !pendingRemoval;

  return {
    items,
    subtotal,
    deliveryFee,
    totalPrice,
    insetsTop,
    navigateToCheckout,
    pendingRemoval,
    showEmptyCart,
    handleProductPress,
    handleGoShopping,
    handleQuantityUpdate,
    handleUndo,
    handleClearCart,
    handleUndoDismiss,
  };
}
