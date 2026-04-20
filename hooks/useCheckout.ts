import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { createOrder, createOrderItems } from '@/lib/api/orderApi';
import { useAuth } from '@/providers/AuthProvider';
import { useCartStore } from '@/store/cartStore';
import { useAddressStore } from '@/store/addressStore';
import { supabase } from '@/lib/services/supabase';
import { formatFullAddress } from '@/lib/utils/addressFormatter';
import { schedulePushNotification } from '@/lib/services/NotificationService';
import { logger } from '@/lib/utils/logger';
import { PaymentMethod } from '@/types';

/**
 * Хук для управления процессом оформления заказа.
 * Инкапсулирует логику взаимодействия с Supabase и уведомлениями.
 */
export function useCheckout() {
  const router = useRouter();
  const { session } = useAuth();
  const items = useCartStore(state => state.items);
  const totalPrice = useCartStore(state => state.totalPrice);
  const discount = useCartStore(state => state.discount);
  const promoCode = useCartStore(state => state.promoCode);
  const clearCart = useCartStore(state => state.clearCart);
  const selectedAddress = useAddressStore(
    state => state.addresses.find(a => a.id === state.selectedAddressId)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckout = useCallback(async (paymentMethod: PaymentMethod, comment?: string) => {
    if (!session?.user) {
      router.push('/(auth)/login');
      return;
    }

    if (!selectedAddress) {
      Alert.alert('Внимание', 'Пожалуйста, выберите адрес доставки перед оформлением заказа.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Создаем основной заказ через API
      const orderData = await createOrder(
        session.user.id,
        totalPrice,
        formatFullAddress(selectedAddress),
        paymentMethod,
        comment,
        promoCode,
        discount,
      );

      // 2. Создаем позиции заказа через API
      const orderItems = items.map((item) => ({
        order_id: orderData.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price_at_time: Number(item.product.price),
      }));

      await createOrderItems(orderItems);

      // 3. Инкрементируем счётчик использований промокода
      if (promoCode) {
        try {
          await supabase.rpc('increment_promo_used_count', { promo_code_text: promoCode });
        } catch (rpcErr) {
          logger.error('Не удалось обновить счётчик промокода:', rpcErr);
        }
      }

      // 4. Обработка успеха: хаптика, уведомления и редирект
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      // Планируем уведомления для имитации процесса доставки
      schedulePushNotification(
        "Заказ оформлен! ✅",
        "Ваш продуктовый набор уже начали собирать на складе.",
        2
      );
      schedulePushNotification(
        "Курьер в пути! 🚴‍♂️",
        "Ожидайте доставку примерно через 15 минут. Вы можете отслеживать статус в приложении.",
        15
      );

      // 5. Очистка и переход
      clearCart();
      router.replace({ pathname: '/order-success', params: { id: orderData.id } });
    } catch (err: unknown) {
      // PostgrestError от Supabase не является instanceof Error — извлекаем message вручную
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null && 'message' in err
            ? String((err as { message: unknown }).message)
            : 'Произошла ошибка при оформлении заказа';
      logger.error('Ошибка оформления заказа:', err);

      Alert.alert('Ошибка оформления', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [session?.user, items, selectedAddress, discount, promoCode, clearCart, router]);

  const handleSelectAddress = () => {
    if (!session?.user) {
      router.push('/(auth)/login');
    } else {
      router.push('/addresses');
    }
  };

  // Переход к экрану оформления заказа из корзины
  const navigateToCheckout = useCallback(() => {
    router.push('/checkout');
  }, [router]);

  return {
    handleCheckout,
    handleSelectAddress,
    navigateToCheckout,
    isSubmitting,
    selectedAddress,
  };
}
