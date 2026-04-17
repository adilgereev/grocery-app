import CartItem from '@/components/cart/CartItem';
import CartPriceSummary from '@/components/cart/CartPriceSummary';
import EmptyCart from '@/components/cart/EmptyCart';
import UndoToast from '@/components/cart/UndoToast';
import FloatingCheckoutButton from '@/components/FloatingCheckoutButton';
import { Colors, FontSize, Radius, Shadows, Spacing } from '@/constants/theme';
import { useCart } from '@/hooks/useCart';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';

export default function CartScreen() {
  const {
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
  } = useCart();

  // Reanimated shared values — view-layer для FloatingCheckoutButton
  const scrollY = useSharedValue(0);
  const layoutHeight = useSharedValue(0);
  const contentHeight = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  if (showEmptyCart) {
    return <EmptyCart insetsTop={insetsTop} onGoShopping={handleGoShopping} />;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insetsTop + Spacing.m }]}>
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

        <CartPriceSummary
          subtotal={subtotal}
          deliveryFee={deliveryFee}
          totalPrice={totalPrice}
        />

        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={navigateToCheckout}
          activeOpacity={0.9}
          testID="cart-checkout-btn"
        >
          <Text style={styles.checkoutText}>Оформить заказ</Text>
        </TouchableOpacity>
      </Animated.ScrollView>

      <FloatingCheckoutButton
        totalPrice={totalPrice}
        isSubmitting={false}
        onCheckout={navigateToCheckout}
        scrollY={scrollY}
        layoutHeight={layoutHeight}
        contentHeight={contentHeight}
      />

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
  itemsCard: {
    backgroundColor: Colors.light.card,
    borderRadius: Radius.xxl,
    marginBottom: Spacing.m,
    overflow: 'hidden',
    ...Shadows.md,
  },
  itemDivider: {
    height: 1,
    backgroundColor: Colors.light.borderLight,
    marginHorizontal: Spacing.m,
  },
  checkoutButton: {
    backgroundColor: Colors.light.cta,
    borderRadius: Radius.pill,
    paddingVertical: Spacing.m,
    paddingHorizontal: Spacing.ml,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  checkoutText: {
    color: Colors.light.white,
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
});
