import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, Image, ScrollView, ActivityIndicator } from 'react-native';
import Animated, { FadeInLeft, Layout, useSharedValue, useAnimatedScrollHandler, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useCartStore } from '@/store/cartStore';
import { Ionicons } from '@expo/vector-icons';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useAddressStore, Address } from '@/store/addressStore';
import { formatFullAddress } from '@/utils/addressFormatter';
import { useRouter } from 'expo-router';
import { schedulePushNotification } from '@/lib/NotificationService';
import { Colors, Spacing, Radius } from '@/constants/theme';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types';

type PaymentMethod = 'online' | 'cash';

const PAYMENT_METHODS: Record<PaymentMethod, { label: string; icon: string; description: string }> = {
  cash: { label: 'Наличными курьеру', icon: 'cash-outline', description: 'Оплата при получении' },
  online: { label: 'Онлайн', icon: 'card', description: 'Списание с карты' },
};

export default function CartScreen() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, totalPrice, clearCart } = useCartStore();
  const { session } = useAuth();
  const { addresses, selectedAddressId } = useAddressStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recommended, setRecommended] = useState<Product[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');

  useEffect(() => {
    if (items.length === 0 && recommended.length === 0) {
      fetchRecommended();
    }
  }, [items.length, recommended.length]);

  const fetchRecommended = async () => {
    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('id', { ascending: false })
        .limit(6);
      if (data) setRecommended(data);
    } catch {
      // Игнорируем ошибку загрузки рекомендаций в production
    }
  };

  // Animated Scroll Values
  const scrollY = useSharedValue(0);
  const layoutHeight = useSharedValue(0);
  const contentHeight = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      layoutHeight.value = event.layoutMeasurement.height;
      contentHeight.value = event.contentSize.height;
    },
  });

  const floatingButtonStyle = useAnimatedStyle(() => {
    if (contentHeight.value === 0 || layoutHeight.value === 0) {
      return { opacity: 0, transform: [{ translateY: 150 }] }; // Начинаем скрыто, пока не подсчитаны размеры
    }
    
    // Если весь контент полностью помещается на экране (без скролла или почти без),
    // нам вообще не нужна плавающая кнопка
    if (contentHeight.value <= layoutHeight.value + 20) {
      return {
        opacity: withTiming(0, { duration: 250 }),
        transform: [{ translateY: withTiming(150, { duration: 300 }) }],
      };
    }

    // Если мы долистали почти до конца (в пределах 120 пикселей от дна),
    // скрываем плавающую кнопку, чтобы исключить наслаивание на оригинальную
    const isAtBottom = scrollY.value + layoutHeight.value >= contentHeight.value - 120;
    
    return {
      opacity: withTiming(isAtBottom ? 0 : 1, { duration: 250 }),
      transform: [{ translateY: withTiming(isAtBottom ? 150 : 0, { duration: 300 }) }],
    };
  });

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  const formatAddress = (addr: Address) => formatFullAddress(addr);

  const handleCheckout = async () => {
    // Soft Gating: Гость хочет купить? Отправляем на логин.
    if (!session?.user) {
      router.push('/(auth)/login');
      return;
    }

    if (!selectedAddress) {
      if (Platform.OS === 'web') window.alert('Укажите адрес доставки!');
      else Alert.alert('Внимание', 'Пожалуйста, выберите адрес доставки перед оформлением заказа.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: session.user.id,
          total_amount: totalPrice,
          delivery_address: formatAddress(selectedAddress),
          status: 'pending',
          payment_method: paymentMethod,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: orderData.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price_at_time: Number(item.product.price),
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      const paymentText = paymentMethod === 'cash' ? 'Наличными' : 'Онлайн';
      if (Platform.OS === 'web') {
        window.alert(`Ура! Ваш заказ успешно оформлен. Оплата: ${paymentText} при получении 🛒`);
      } else {
        Alert.alert('Готово!', `Ваш заказ успешно оформлен и передан на сборку 🛒\nОплата: ${paymentText} при получении`);
        schedulePushNotification("Заказ оформлен! ✅", "Ваш продуктовый набор уже начали собирать на складе.", 2);
        schedulePushNotification("Курьер в пути! 🚴‍♂️", "Ожидайте доставку примерно через 15 минут. Вы можете отслеживать статус в приложении.", 15);
      }

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

  const renderFooter = () => (
    <View style={styles.listFooter}>
      <Text style={styles.addressLabel}>Куда доставлять?</Text>
      <TouchableOpacity
        style={styles.addressSelector}
        onPress={() => {
          if (!session?.user) {
            router.push('/(auth)/login');
          } else {
            router.push('/addresses');
          }
        }}
        disabled={isSubmitting}
      >
        <View style={styles.addressTextContainer}>
          {selectedAddress ? (
            <Text style={styles.addressSelectedText} numberOfLines={1}>{formatAddress(selectedAddress)}</Text>
          ) : (
            <Text style={styles.addressPlaceholder}>Выберите адрес доставки</Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.light.textLight} />
      </TouchableOpacity>

      {/* Выбор способа оплаты */}
      <Text style={styles.paymentLabel}>Способ оплаты</Text>
      <View style={styles.paymentContainer}>
        {(Object.keys(PAYMENT_METHODS) as PaymentMethod[]).map((method) => {
          const isSelected = paymentMethod === method;
          return (
            <TouchableOpacity
              key={method}
              style={[
                styles.paymentOption,
                isSelected && styles.paymentOptionSelected,
              ]}
              onPress={() => setPaymentMethod(method)}
              disabled={isSubmitting}
              activeOpacity={0.7}
            >
              <View style={styles.paymentIconContainer}>
                <Ionicons
                  name={PAYMENT_METHODS[method].icon as keyof typeof Ionicons.glyphMap}
                  size={20}
                  color={isSelected ? Colors.light.primary : Colors.light.textSecondary}
                />
              </View>
              <View style={styles.paymentMethodInfo}>
                <Text style={[
                  styles.paymentLabelOption,
                  isSelected && styles.paymentLabelOptionSelected,
                ]}>
                  {PAYMENT_METHODS[method].label}
                </Text>
                <Text style={styles.paymentDescription}>
                  {PAYMENT_METHODS[method].description}
                </Text>
              </View>
              {isSelected && (
                <View style={styles.paymentCheckmark}>
                  <Ionicons name="checkmark-circle" size={22} color={Colors.light.primary} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.receiptCard}>
        <Text style={styles.receiptTitle}>Детали заказа</Text>
        
        <View style={styles.receiptRow}>
          <Text style={styles.receiptText}>Товары ({items.length})</Text>
          <Text style={styles.receiptText}>{totalPrice.toFixed(0)} ₽</Text>
        </View>
        
        <View style={styles.receiptRow}>
          <Text style={styles.receiptText}>Доставка</Text>
          <Text style={styles.receiptTextFree}>Бесплатно</Text>
        </View>

        <View style={styles.receiptDivider} />

        <View style={styles.receiptRowTotal}>
          <Text style={styles.receiptTotalLabel}>Итого</Text>
          <Text style={styles.receiptTotalPrice}>{totalPrice.toFixed(0)} ₽</Text>
        </View>
      </View>

      {/* ОРГАНИЧНАЯ КНОПКА (Она плавно заменяет собой плавающую, когда пользователь доскроллил до конца) */}
      <View style={styles.organicButtonContainer}>
        <TouchableOpacity 
          style={[styles.checkoutButton, isSubmitting && styles.checkoutButtonSubmitting]} 
          onPress={handleCheckout}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
             <ActivityIndicator color={Colors.light.card} />
          ) : (
             <>
               <Text style={styles.checkoutText}>Оформить заказ</Text>
               <View style={styles.checkoutPriceTag}>
                 <Text style={styles.checkoutPriceText}>{totalPrice.toFixed(0)} ₽</Text>
               </View>
             </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Корзина</Text>
        <ScrollView contentContainerStyle={styles.emptyScrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.emptyHeader}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="cart-outline" size={48} color={Colors.light.primary} />
            </View>
            <Text style={styles.emptyTitle}>В корзине пусто</Text>
            <Text style={styles.emptySubText}>Посмотрите популярные товары или перейдите в каталог</Text>
            
            <TouchableOpacity style={styles.goShoppingBtn} onPress={() => router.push('/(tabs)/(index)')}>
              <Text style={styles.goShoppingBtnText}>Перейти к покупкам</Text>
            </TouchableOpacity>
          </View>

          {recommended.length > 0 && (
            <View style={styles.recommendedSection}>
              <Text style={styles.sectionTitle}>Обратите внимание</Text>
              <View style={styles.gridContainer}>
                {recommended.map((item, index) => (
                  <View key={`rec-${item.id}`} style={styles.gridItem}>
                    <ProductCard item={item} index={index} />
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Корзина</Text>
      
      <Animated.FlatList
        data={items}
        keyExtractor={(item) => item.product.id}
        contentContainerStyle={styles.listContainer}
        itemLayoutAnimation={Layout.springify()}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onLayout={(e) => {
          layoutHeight.value = e.nativeEvent.layout.height;
        }}
        onContentSizeChange={(_, height) => {
          contentHeight.value = height;
        }}
        renderItem={({ item, index }: { item: any; index: number }) => (
          <Animated.View 
            entering={FadeInLeft.delay(index * 50).duration(400)} 
            layout={Layout.springify()} 
            style={styles.cartItem}
          >
            <TouchableOpacity 
              style={styles.itemTouchRow}
              activeOpacity={0.7}
              onPress={() => router.push(`/product/${item.product.id}?name=${encodeURIComponent(item.product.name)}`)}
            >
              {item.product.image_url ? (
                <Image source={{ uri: item.product.image_url }} style={styles.itemImage} />
              ) : (
                <View style={[styles.itemImage, styles.imagePlaceholder]} />
              )}
              
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.product.name}</Text>
                <Text style={styles.itemPrice}>{(Number(item.product.price) * item.quantity).toFixed(0)} ₽</Text>
                {item.quantity > 1 && (
                  <Text style={styles.itemUnitInfo}>
                    {Number(item.product.price)} ₽ / шт
                  </Text>
                )}
              </View>
            </TouchableOpacity>

            <View style={styles.quantityControl}>
              <TouchableOpacity style={styles.circleButton} onPress={() => updateQuantity(item.product.id, item.quantity - 1)}>
                <Ionicons name="remove" size={16} color={Colors.light.text} />
              </TouchableOpacity>
              
              <Text style={styles.quantityText}>{item.quantity}</Text>
              
              <TouchableOpacity style={styles.circleButton} onPress={() => updateQuantity(item.product.id, item.quantity + 1)}>
                <Ionicons name="add" size={16} color={Colors.light.text} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.deleteButton} onPress={() => removeItem(item.product.id)}>
              <Ionicons name="trash-outline" size={22} color={Colors.light.error} />
            </TouchableOpacity>
          </Animated.View>
        )}
      />

      {/* FLOATING BUTTON (Она исчезает, когда мы доскроллили до органичной кнопки) */}
      <Animated.View 
        style={[styles.floatingButtonContainer, floatingButtonStyle]}
        pointerEvents="box-none"
      >
        <TouchableOpacity 
          style={[styles.floatingCheckoutButton, isSubmitting && styles.floatingButtonSubmitting]} 
          onPress={handleCheckout}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
             <ActivityIndicator color={Colors.light.card} size="small" />
          ) : (
             <>
               <Text style={styles.floatingCheckoutText}>Оформить заказ</Text>
               <View style={styles.floatingCheckoutPriceTag}>
                 <Text style={styles.floatingCheckoutPriceText}>{totalPrice.toFixed(0)} ₽</Text>
               </View>
             </>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.light.text,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: Spacing.xxl, // Нам больше не нужно огромное пространство (120px), так как кнопка уезжает в конце скролла
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: Radius.xl,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: Colors.light.text,
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  itemTouchRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  imagePlaceholder: { backgroundColor: Colors.light.borderLight },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 14,
    marginRight: Spacing.m,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  itemUnitInfo: { fontSize: 12, color: Colors.light.textLight, marginTop: 2 },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.borderLight,
    borderRadius: Radius.xxl,
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
    marginRight: 12,
  },
  circleButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.card,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    shadowColor: Colors.light.text,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '700',
    marginHorizontal: 12,
    color: Colors.light.text,
    minWidth: 12,
    textAlign: 'center',
  },
  deleteButton: {
    padding: Spacing.s,
  },
  emptyScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: Spacing.xl,
  },
  emptyHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
    marginBottom: 40,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.m,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: Spacing.s,
  },
  emptySubText: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.l,
    paddingHorizontal: Spacing.l,
    lineHeight: 22,
  },
  goShoppingBtn: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 14,
    borderRadius: Radius.xl,
    elevation: 4,
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  goShoppingBtnText: {
    color: Colors.light.card,
    fontSize: 16,
    fontWeight: '700',
  },
  recommendedSection: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: Spacing.m,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    marginBottom: Spacing.m,
  },
  listFooter: {
    marginTop: Spacing.m,
    paddingBottom: 20,
  },
  addressLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 12,
    paddingHorizontal: Spacing.xs,
  },
  addressSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.card,
    borderRadius: 18,
    padding: Spacing.m,
    marginBottom: Spacing.l,
    elevation: 2,
    shadowColor: Colors.light.text,
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  addressTextContainer: { flex: 1, marginRight: 12 },
  addressSelectedText: {
    fontSize: 15,
    color: Colors.light.text,
    fontWeight: '600',
  },
  addressPlaceholder: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    fontWeight: '500'
  },
  // Выбор способа оплаты
  paymentLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 12,
    paddingHorizontal: Spacing.xs,
  },
  paymentContainer: {
    gap: 10,
    marginBottom: Spacing.l,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: 18,
    padding: Spacing.m,
    borderWidth: 2,
    borderColor: Colors.light.card,
    elevation: 2,
    shadowColor: Colors.light.text,
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  paymentOptionSelected: {
    backgroundColor: Colors.light.primaryLight,
    borderColor: Colors.light.primaryBorder,
    borderWidth: 2,
    elevation: 3,
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  paymentIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.m,
  },
  paymentMethodInfo: { flex: 1 },
  paymentLabelOption: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 2,
  },
  paymentLabelOptionSelected: {
    color: Colors.light.primary,
  },
  paymentDescription: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  paymentCheckmark: {
    marginLeft: Spacing.s,
  },
  receiptCard: {
    backgroundColor: Colors.light.card,
    borderRadius: Radius.xl,
    padding: 20,
    elevation: 2,
    shadowColor: Colors.light.text,
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.m,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  receiptText: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  receiptTextFree: {
    fontSize: 15,
    color: Colors.light.primary,
    fontWeight: '700',
  },
  receiptDivider: {
    height: 1,
    backgroundColor: Colors.light.borderLight,
    marginVertical: Spacing.m,
    marginHorizontal: -20,
  },
  receiptRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptTotalLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.text,
  },
  receiptTotalPrice: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.light.text,
  },
  // Плавающая кнопка
  floatingButtonContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 16 : 12,
    left: Spacing.xxl,
    right: Spacing.xxl,
  },
  floatingCheckoutButton: {
    flexDirection: 'row',
    backgroundColor: Colors.light.primary,
    borderRadius: 100,
    paddingVertical: 12,
    paddingHorizontal: Spacing.m,
    alignItems: 'center',
    justifyContent: 'space-between', 
    elevation: 6,
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  floatingButtonSubmitting: { opacity: 0.7 },
  floatingCheckoutText: {
    color: Colors.light.card,
    fontSize: 15,
    fontWeight: '700',
    marginLeft: Spacing.xs,
  },
  floatingCheckoutPriceTag: {
    backgroundColor: Colors.light.whiteTransparent,
    paddingHorizontal: 10,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.l,
  },
  floatingCheckoutPriceText: {
    color: Colors.light.card,
    fontSize: 14,
    fontWeight: '800',
  },
  organicButtonContainer: { marginTop: Spacing.l },
  checkoutButton: {
    flexDirection: 'row',
    backgroundColor: Colors.light.primary,
    borderRadius: 100,
    paddingVertical: Spacing.m,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-between', 
    elevation: 8,
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  checkoutButtonSubmitting: { opacity: 0.7 },
  checkoutText: {
    color: Colors.light.card,
    fontSize: 17,
    fontWeight: '700',
    marginLeft: Spacing.s,
  },
  checkoutPriceTag: {
    backgroundColor: Colors.light.whiteTransparent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.xl,
  },
  checkoutPriceText: {
    color: Colors.light.card,
    fontSize: 15,
    fontWeight: '800',
  }
});
