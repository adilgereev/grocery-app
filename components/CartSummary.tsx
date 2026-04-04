import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors, Radius, Spacing, Shadows } from '@/constants/theme';
import { Address } from '@/store/addressStore';

export type PaymentMethod = 'online' | 'cash';

const PAYMENT_METHODS: Record<PaymentMethod, { label: string; icon: string; description: string }> = {
  cash: { label: 'Наличными курьеру', icon: 'cash-outline', description: 'Оплата при получении' },
  online: { label: 'Онлайн', icon: 'card', description: 'Списание с карты' },
};

interface CartSummaryProps {
  itemsCount: number;
  subtotal: number;
  deliveryFee: number;
  totalPrice: number;
  selectedAddress?: Address;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  onCheckout: () => void;
  onSelectAddress: () => void;
  isSubmitting: boolean;
  formatAddress: (addr: Address) => string;
}

/**
 * Компонент итогов корзины (чекаут-блок).
 * Вынесен из app/(tabs)/(cart)/index.tsx для декомпозиции.
 */
export default function CartSummary({
  itemsCount,
  subtotal,
  deliveryFee,
  totalPrice,
  selectedAddress,
  paymentMethod,
  setPaymentMethod,
  onCheckout,
  onSelectAddress,
  isSubmitting,
  formatAddress
}: CartSummaryProps) {
  return (
    <View style={styles.listFooter}>
      <Text style={styles.addressLabel}>Куда доставлять?</Text>
      <TouchableOpacity
        style={styles.addressSelector}
        onPress={onSelectAddress}
        disabled={isSubmitting}
        activeOpacity={0.7}
        testID="cart-address-selector"
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
              testID={`payment-method-${method}`}
            >
              <View style={styles.paymentIconContainer}>
                <Ionicons
                  name={PAYMENT_METHODS[method].icon as any}
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
          <Text style={styles.receiptText}>Товары ({itemsCount})</Text>
          <Text style={styles.receiptText}>{subtotal.toFixed(0)} ₽</Text>
        </View>

        <View style={styles.receiptRow}>
          <Text style={styles.receiptText}>Доставка</Text>
          {deliveryFee > 0 ? (
            <Text style={styles.receiptText}>{deliveryFee.toFixed(0)} ₽</Text>
          ) : (
            <Text style={styles.receiptTextFree}>Бесплатно</Text>
          )}
        </View>


        <View style={styles.receiptDivider} />

        <View style={styles.receiptRowTotal}>
          <Text style={styles.receiptTotalLabel}>Итого</Text>
          <Text style={styles.receiptTotalPrice}>{totalPrice.toFixed(0)} ₽</Text>
        </View>
      </View>

      {/* ОРГАНИЧНАЯ КНОПКА */}
      <View style={styles.organicButtonContainer}>
        <TouchableOpacity
          style={[styles.checkoutButton, isSubmitting && styles.checkoutButtonSubmitting]}
          onPress={onCheckout}
          disabled={isSubmitting}
          activeOpacity={0.9}
          testID="cart-checkout-btn"
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
}

const styles = StyleSheet.create({
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
    ...Shadows.md,
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
    ...Shadows.sm,
  },
  paymentOptionSelected: {
    backgroundColor: Colors.light.primaryLight,
    borderColor: Colors.light.primaryBorder,
    borderWidth: 2,
    ...Shadows.md,
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
    ...Shadows.md,
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
    fontWeight: '700',
    color: Colors.light.text,
  },
  receiptTotalPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
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
    ...Shadows.md,
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
    fontWeight: '700',
  },
});
