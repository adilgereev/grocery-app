import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, SharedValue } from 'react-native-reanimated';

import { Colors, Radius, Spacing, Duration, Shadows } from '@/constants/theme';

interface FloatingCheckoutButtonProps {
  totalPrice: number;
  isSubmitting: boolean;
  onCheckout: () => void;
  scrollY: SharedValue<number>;
  layoutHeight: SharedValue<number>;
  contentHeight: SharedValue<number>;
  checkoutButtonY: SharedValue<number>;
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
  contentHeight,
  checkoutButtonY,
}: FloatingCheckoutButtonProps) {

  const floatingButtonStyle = useAnimatedStyle(() => {
    // Ждём первого layout
    if (contentHeight.value === 0 || layoutHeight.value === 0 || checkoutButtonY.value === 0) {
      return { opacity: 0, transform: [{ translateY: 150 }] };
    }

    // Всё содержимое влезает на экран — плавающая кнопка не нужна
    if (contentHeight.value <= layoutHeight.value + 20) {
      return {
        opacity: withTiming(0, { duration: Duration.fast }),
        transform: [{ translateY: withTiming(150, { duration: Duration.default }) }],
      };
    }

    // Скрываем, когда статичная кнопка "Оформить заказ" входит в зону видимости
    const isStaticButtonVisible = checkoutButtonY.value < scrollY.value + layoutHeight.value;

    return {
      opacity: withTiming(isStaticButtonVisible ? 0 : 1, { duration: Duration.fast }),
      transform: [{ translateY: withTiming(isStaticButtonVisible ? 150 : 0, { duration: Duration.default }) }],
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
          <ActivityIndicator color={Colors.light.white} size="small" />
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
    backgroundColor: Colors.light.cta,
    borderRadius: Radius.pill,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.m,
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.md,
  },
  floatingButtonSubmitting: { opacity: 0.7 },
  floatingCheckoutText: {
    color: Colors.light.white,
    fontSize: 15,
    fontWeight: '700',
    marginLeft: Spacing.xs,
  },
  floatingCheckoutPriceTag: {
    backgroundColor: Colors.light.whiteTransparent,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.xl,
  },
  floatingCheckoutPriceText: {
    color: Colors.light.white,
    fontSize: 14,
    fontWeight: '700', // Софт-болд
  },
});
