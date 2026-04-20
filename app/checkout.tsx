import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ScreenHeader from '@/components/ui/ScreenHeader';
import CheckoutAddress from '@/components/checkout/CheckoutAddress';
import CheckoutComment from '@/components/checkout/CheckoutComment';
import PaymentSelector from '@/components/cart/PaymentSelector';
import OrderReceipt from '@/components/cart/OrderReceipt';
import PromoCodeInput from '@/components/cart/PromoCodeInput';

import { Colors, FontSize, Radius, Shadows, Spacing } from '@/constants/theme';
import { useCheckout } from '@/hooks/useCheckout';
import { useCartStore } from '@/store/cartStore';
import { formatFullAddress } from '@/lib/utils/addressFormatter';
import { Address, PaymentMethod } from '@/types';

// Высота фиксированного футера с кнопкой подтверждения
const FOOTER_HEIGHT = 84;

/**
 * Экран оформления заказа (Самокат/Яндекс Лавка стиль).
 * Открывается из корзины по кнопке "Оформить заказ".
 */
export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();

  const items = useCartStore(state => state.items);
  const subtotal = useCartStore(state => state.subtotal);
  const deliveryFee = useCartStore(state => state.deliveryFee);
  const totalPrice = useCartStore(state => state.totalPrice);
  const discount = useCartStore(state => state.discount);
  const promoCode = useCartStore(state => state.promoCode);

  const { handleCheckout, handleSelectAddress, isSubmitting, selectedAddress } = useCheckout();

  const [comment, setComment] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');

  const formatAddress = useCallback((addr: Address) => formatFullAddress(addr), []);

  const handleConfirm = useCallback(() => {
    handleCheckout(paymentMethod, comment);
  }, [handleCheckout, paymentMethod, comment]);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Оформление" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: FOOTER_HEIGHT + insets.bottom + Spacing.m },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <CheckoutAddress
            selectedAddress={selectedAddress}
            onSelectAddress={handleSelectAddress}
            disabled={isSubmitting}
            formatAddress={formatAddress}
          />

          <CheckoutComment
            value={comment}
            onChangeText={setComment}
            disabled={isSubmitting}
          />

          <PromoCodeInput />

          <View style={styles.paymentWrapper}>
            <Text style={styles.sectionLabel}>СПОСОБ ОПЛАТЫ</Text>
            <PaymentSelector
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              disabled={isSubmitting}
            />
          </View>

          <OrderReceipt
            itemsCount={items.length}
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            totalPrice={totalPrice}
            discount={discount}
            promoCode={promoCode}
          />
        </ScrollView>

        {/* Фиксированная кнопка подтверждения */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.m }]}>
          <TouchableOpacity
            style={[styles.confirmButton, isSubmitting && styles.confirmButtonSubmitting]}
            onPress={handleConfirm}
            disabled={isSubmitting}
            activeOpacity={0.9}
            testID="checkout-confirm-btn"
          >
            {isSubmitting ? (
              <ActivityIndicator color={Colors.light.white} />
            ) : (
              <Text style={styles.confirmText}>Подтвердить заказ</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.ml,
    paddingTop: Spacing.m,
  },
  paymentWrapper: {
    marginBottom: Spacing.m,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.light.textSecondary,
    letterSpacing: 1.5,
    marginBottom: Spacing.s,
    paddingHorizontal: Spacing.xs,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.ml,
    paddingTop: Spacing.sm,
    backgroundColor: Colors.light.background,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
  },
  confirmButton: {
    flexDirection: 'row',
    backgroundColor: Colors.light.cta,
    borderRadius: Radius.pill,
    paddingVertical: Spacing.m,
    paddingHorizontal: Spacing.ml,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  confirmButtonSubmitting: {
    opacity: 0.7,
  },
  confirmText: {
    color: Colors.light.white,
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
});
