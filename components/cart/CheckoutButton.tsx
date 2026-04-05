import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '@/constants/theme';
import { cartSummaryStyles as s } from './CartSummary.styles';

interface CheckoutButtonProps {
  totalPrice: number;
  isSubmitting: boolean;
  onCheckout: () => void;
}

export default function CheckoutButton({
  totalPrice,
  isSubmitting,
  onCheckout,
}: CheckoutButtonProps) {
  return (
    <View style={s.organicButtonContainer}>
      <TouchableOpacity
        style={[s.checkoutButton, isSubmitting && s.checkoutButtonSubmitting]}
        onPress={onCheckout}
        disabled={isSubmitting}
        activeOpacity={0.9}
        testID="cart-checkout-btn"
      >
        {isSubmitting ? (
          <ActivityIndicator color={Colors.light.card} />
        ) : (
          <>
            <Text style={s.checkoutText}>Оформить заказ</Text>
            <View style={s.checkoutPriceTag}>
              <Text style={s.checkoutPriceText}>{totalPrice.toFixed(0)} ₽</Text>
            </View>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
