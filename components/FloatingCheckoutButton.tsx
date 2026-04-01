import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, SharedValue } from 'react-native-reanimated';

import { Colors, Radius, Spacing } from '@/constants/theme';

interface FloatingCheckoutButtonProps {
  totalPrice: number;
  isSubmitting: boolean;
  onCheckout: () => void;
  scrollY: SharedValue<number>;
  layoutHeight: SharedValue<number>;
  contentHeight: SharedValue<number>;
}

/**
 * Анимированная плавающая кнопка оформления заказа.
 * Скрывается, когда пользователь доходит до конца списка (до "органичной" кнопки).
 * Вынесена из app/(tabs)/(cart)/index.tsx для декомпозиции.
 */
export default function FloatingCheckoutButton({
  totalPrice,
  isSubmitting,
  onCheckout,
  scrollY,
  layoutHeight,
  contentHeight
}: FloatingCheckoutButtonProps) {
  
  const floatingButtonStyle = useAnimatedStyle(() => {
    // Если размеры еще не определены, скрываем кнопку
    if (contentHeight.value === 0 || layoutHeight.value === 0) {
      return { opacity: 0, transform: [{ translateY: 150 }] };
    }

    // Если всё содержимое влезает на экран, плавающая кнопка не нужна
    if (contentHeight.value <= layoutHeight.value + 20) {
      return {
        opacity: withTiming(0, { duration: 250 }),
        transform: [{ translateY: withTiming(150, { duration: 300 }) }],
      };
    }

    // Скрываем, если дошли до низа (осталось меньше 120 пикселей)
    const isAtBottom = scrollY.value + layoutHeight.value >= contentHeight.value - 120;

    return {
      opacity: withTiming(isAtBottom ? 0 : 1, { duration: 250 }),
      transform: [{ translateY: withTiming(isAtBottom ? 150 : 0, { duration: 300 }) }],
    };
  });

  return (
    <Animated.View
      style={[styles.floatingButtonContainer, floatingButtonStyle]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        style={[styles.floatingCheckoutButton, isSubmitting && styles.floatingButtonSubmitting]}
        onPress={onCheckout}
        disabled={isSubmitting}
        activeOpacity={0.9}
        testID="cart-floating-checkout-btn"
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
  );
}

const styles = StyleSheet.create({
  floatingButtonContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 16 : 12,
    left: Spacing.xxl,
    right: Spacing.xxl,
    zIndex: 100,
  },
  floatingCheckoutButton: {
    flexDirection: 'row',
    backgroundColor: Colors.light.primary,
    borderRadius: 100,
    paddingVertical: 12,
    paddingHorizontal: Spacing.m,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: Colors.light.text,
    shadowOpacity: 0.05,
    shadowRadius: 10,
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
    fontWeight: '700', // Софт-болд
  },
});
