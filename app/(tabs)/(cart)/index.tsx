import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import EmptyCart from '@/components/cart/EmptyCart';
import UndoToast from '@/components/cart/UndoToast';
import FloatingCheckoutButton from '@/components/FloatingCheckoutButton';
import { Colors, FontSize, Radius, Shadows, Spacing } from '@/constants/theme';
import { useCheckout } from '@/hooks/useCheckout';
import { useCartStore } from '@/store/cartStore';
import { Address, PaymentMethod, Product } from '@/types';
import { formatFullAddress } from '@/lib/utils/addressFormatter';
import React, { useCallback, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { LinearTransition, useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Основной экран корзины.
 * Логика чекаута вынесена в useCheckout, логика расчетов — в cartStore.
 */
export default function CartScreen() {
  const items = useCartStore(state => state.items);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const removeItem = useCartStore(state => state.removeItem);
  const addItem = useCartStore(state => state.addItem);
  const clearCart = useCartStore(state => state.clearCart);
  const subtotal = useCartStore(state => state.subtotal);
  const deliveryFee = useCartStore(state => state.deliveryFee);
  const totalPrice = useCartStore(state => state.totalPrice);

  const insets = useSafeAreaInsets();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');

  const {
    handleCheckout,
    handleSelectAddress,
    isSubmitting,
    selectedAddress
  } = useCheckout();

  // Reanimated Shared Values для плавающей кнопки
  const scrollY = useSharedValue(0);
  const layoutHeight = useSharedValue(0);
  const contentHeight = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const router = useRouter();

  // Состояние товара, ожидающего удаления (для undo)
  const [pendingRemoval, setPendingRemoval] = useState<{
    item: { product: Product; quantity: number };
    timerId: ReturnType<typeof setTimeout>;
  } | null>(null);

  const formatAddress = useCallback((addr: Address | null | undefined) => formatFullAddress(addr), []);

  const handleProductPress = useCallback((productId: string, productName: string) => {
    router.push(`/product/${productId}?name=${encodeURIComponent(productName)}`);
  }, [router]);

  const handleGoShopping = useCallback(() => {
    router.push('/(tabs)/(index)');
  }, [router]);

  // Перехватчик updateQuantity: qty=0 → удаление с возможностью отмены
  const handleQuantityUpdate = useCallback((productId: string, quantity: number) => {
    if (quantity > 0) {
      updateQuantity(productId, quantity);
      return;
    }
    const item = items.find(i => i.product.id === productId);
    if (!item) return;

    // Отменяем предыдущий undo если был
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

  if (items.length === 0 && !pendingRemoval) {
    return <EmptyCart insetsTop={insets.top} onGoShopping={handleGoShopping} />;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.m }]}>
        <Text style={styles.headerTitle}>Корзина</Text>
        {items.length > 0 && (
          <TouchableOpacity onPress={handleClearCart} testID="cart-clear-button" hitSlop={8}>
            <Ionicons name="trash-outline" size={22} color={Colors.light.error} />
          </TouchableOpacity>
        )}
      </View>

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onLayout={(e) => {
          layoutHeight.value = e.nativeEvent.layout.height;
        }}
        onContentSizeChange={(_, height) => {
          contentHeight.value = height;
        }}
      >
        {/* Единая карточка со всеми товарами */}
        {items.length > 0 && (
          <View style={styles.itemsCard}>
            {items.map((item, index) => (
              <React.Fragment key={item.product.id}>
                <CartItem
                  item={item}
                  index={index}
                  onUpdateQuantity={handleQuantityUpdate}
                  onPress={() => handleProductPress(item.product.id, item.product.name)}
                />
                {index < items.length - 1 && <View style={styles.itemDivider} />}
              </React.Fragment>
            ))}
          </View>
        )}

        {/* Секция итогов и чекаута */}
        <Animated.View layout={LinearTransition.springify()}>
          <CartSummary
            itemsCount={items.length}
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            totalPrice={totalPrice}
            selectedAddress={selectedAddress}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            onCheckout={() => handleCheckout(paymentMethod)}
            onSelectAddress={handleSelectAddress}
            isSubmitting={isSubmitting}
            formatAddress={formatAddress}
          />
        </Animated.View>

      </Animated.ScrollView>

      <FloatingCheckoutButton
        totalPrice={totalPrice}
        isSubmitting={isSubmitting}
        onCheckout={() => handleCheckout(paymentMethod)}
        scrollY={scrollY}
        layoutHeight={layoutHeight}
        contentHeight={contentHeight}
      />

      {/* Снэкбар отмены удаления товара */}
      {pendingRemoval && (
        <UndoToast
          productName={pendingRemoval.item.product.name}
          onUndo={handleUndo}
          onDismiss={handleUndoDismiss}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.ml,
    backgroundColor: Colors.light.background,
    paddingBottom: Spacing.s,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: FontSize.big,
    fontWeight: '700',
    color: Colors.light.text,
  },
  scrollContent: {
    paddingHorizontal: Spacing.ml,
    paddingBottom: Spacing.xxl,
  },
  // Единая карточка для всех товаров
  itemsCard: {
    backgroundColor: Colors.light.card,
    borderRadius: Radius.xxl,
    marginBottom: Spacing.m,
    overflow: 'hidden',
    ...Shadows.md,
  },
  // Разделитель между товарами
  itemDivider: {
    height: 1,
    backgroundColor: Colors.light.borderLight,
    marginHorizontal: Spacing.m,
  },
});
