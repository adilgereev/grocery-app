import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { createOrder, createOrderItems } from '@/lib/api/orderApi';
import { useAuth } from '@/providers/AuthProvider';
import { useCartStore } from '@/store/cartStore';
import { useAddressStore } from '@/store/addressStore';
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
  const clearCart = useCartStore(state => state.clearCart);
  const selectedAddress = useAddressStore(
    state => state.addresses.find(a => a.id === state.selectedAddressId)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckout = async (paymentMethod: PaymentMethod) => {
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
        paymentMethod
      );

      // 2. Создаем позиции заказа через API
      const orderItems = items.map((item) => ({
        order_id: orderData.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price_at_time: Number(item.product.price),
      }));

      await createOrderItems(orderItems);

      // 3. Обработка успеха: уведомления и редирект
      const paymentText = paymentMethod === 'cash' ? 'Наличными' : 'Онлайн';

      Alert.alert(
        'Готово!',
        `Ваш заказ успешно оформлен и передан на сборку 🛒\nОплата: ${paymentText} при получении`
      );

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

      // 4. Очистка и переход
      clearCart();
      router.push('/orders');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при оформлении заказа';
      logger.error('Ошибка оформления заказа:', errorMessage);
      
      Alert.alert('Ошибка оформления', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectAddress = () => {
    if (!session?.user) {
      router.push('/(auth)/login');
    } else {
      router.push('/addresses');
    }
  };

  return {
    handleCheckout,
    handleSelectAddress,
    isSubmitting,
    selectedAddress,
  };
}
