import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { createOrder, createOrderItems } from '@/lib/orderApi';
import { useAuth } from '@/providers/AuthProvider';
import { useCartStore } from '@/store/cartStore';
import { useAddressStore } from '@/store/addressStore';
import { formatFullAddress } from '@/utils/addressFormatter';
import { schedulePushNotification } from '@/lib/NotificationService';
import { logger } from '@/lib/logger';
import { Address, PaymentMethod } from '@/types';

/**
 * Хук для управления процессом оформления заказа.
 * Инкапсулирует логику взаимодействия с Supabase и уведомлениями.
 */
export function useCheckout() {
  const router = useRouter();
  const { session } = useAuth();
  const { items, totalPrice, clearCart } = useCartStore();
  const { addresses, selectedAddressId } = useAddressStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  const handleCheckout = async (paymentMethod: PaymentMethod) => {
    if (!session?.user) {
      router.push('/(auth)/login');
      return;
    }

    if (!selectedAddress) {
      const msg = 'Пожалуйста, выберите адрес доставки перед оформлением заказа.';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Внимание', msg);
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
      
      if (Platform.OS === 'web') {
        window.alert(`Ура! Ваш заказ успешно оформлен. Оплата: ${paymentText} при получении 🛒`);
      } else {
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
      }

      // 4. Очистка и переход
      clearCart();
      router.push('/orders');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при оформлении заказа';
      logger.error('Ошибка оформления заказа:', errorMessage);
      
      if (Platform.OS === 'web') window.alert(`Ошибка: ${errorMessage}`);
      else Alert.alert('Ошибка оформления', errorMessage);
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
