import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import EmptyCart from '@/components/cart/EmptyCart';
import FloatingCheckoutButton from '@/components/FloatingCheckoutButton';
import { Colors, Duration, FontSize, Spacing } from '@/constants/theme';
import { useCheckout } from '@/hooks/useCheckout';
import { useCartStore } from '@/store/cartStore';
import { Address, PaymentMethod } from '@/types';
import { formatFullAddress } from '@/utils/addressFormatter';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Layout, useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Основной экран корзины.
 * Логика чекаута вынесена в useCheckout, логика расчетов — в cartStore.
 */
export default function CartScreen() {
  const { 
    items, 
    updateQuantity, 
    removeItem, 
    subtotal, 
    deliveryFee, 
    totalPrice 
  } = useCartStore();
  
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

  const formatAddress = (addr: Address | null | undefined) => formatFullAddress(addr);

  // Состояние пустой корзины с рекомендациями
  if (items.length === 0) {
    return <EmptyCart insetsTop={insets.top} />;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.m }]}>
        <Text style={styles.headerTitle}>Корзина</Text>
      </View>

      <Animated.FlatList
        data={items}
        keyExtractor={(item) => item.product.id}
        contentContainerStyle={styles.listContainer}
        itemLayoutAnimation={Layout.springify()}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onLayout={(e) => {
          layoutHeight.value = e.nativeEvent.layout.height;
        }}
        onContentSizeChange={(_, height) => {
          contentHeight.value = height;
        }}
        ListFooterComponent={
          // Задержка равна длительности FadeOutLeft (Duration.fast),
          // чтобы футер не наезжал на удаляемый элемент до завершения его анимации
          <Animated.View layout={Layout.springify().delay(Duration.fast)}>
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
        }
        renderItem={({ item, index }) => (
          <CartItem
            item={item}
            index={index}
            onUpdateQuantity={updateQuantity}
            onRemove={removeItem}
          />
        )}
      />

      <FloatingCheckoutButton
        totalPrice={totalPrice}
        isSubmitting={isSubmitting}
        onCheckout={() => handleCheckout(paymentMethod)}
        scrollY={scrollY}
        layoutHeight={layoutHeight}
        contentHeight={contentHeight}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingHorizontal: 20,
    backgroundColor: Colors.light.background,
    paddingBottom: Spacing.s,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: FontSize.big, 
    fontWeight: '700',
    color: Colors.light.text,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: Spacing.xxl,
  },
});
