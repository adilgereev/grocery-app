import React from 'react';
import { Text, View } from 'react-native';
import { cartSummaryStyles as s } from './CartSummary.styles';

interface OrderReceiptProps {
  itemsCount: number;
  subtotal: number;
  deliveryFee: number;
  totalPrice: number;
  discount?: number;
  promoCode?: string | null;
}

export default function OrderReceipt({
  itemsCount,
  subtotal,
  deliveryFee,
  totalPrice,
  discount,
  promoCode,
}: OrderReceiptProps) {
  return (
    <View style={s.receiptCard}>
      <Text style={s.receiptTitle}>Детали заказа</Text>

      <View style={s.receiptRow}>
        <Text style={s.receiptText}>Товары ({itemsCount})</Text>
        <Text style={s.receiptText}>{subtotal.toFixed(0)} ₽</Text>
      </View>

      <View style={s.receiptRow}>
        <Text style={s.receiptText}>Доставка</Text>
        {deliveryFee > 0 ? (
          <Text style={s.receiptText}>{deliveryFee.toFixed(0)} ₽</Text>
        ) : (
          <Text style={s.receiptTextFree}>Бесплатно</Text>
        )}
      </View>

      {discount != null && discount > 0 && (
        <View style={s.receiptRow}>
          <Text style={s.receiptText}>Промокод {promoCode}</Text>
          <Text style={s.receiptTextDiscount}>−{discount.toFixed(0)} ₽</Text>
        </View>
      )}

      <View style={s.receiptDivider} />

      <View style={s.receiptRowTotal}>
        <Text style={s.receiptTotalLabel}>Итого</Text>
        <Text style={s.receiptTotalPrice}>{totalPrice.toFixed(0)} ₽</Text>
      </View>
    </View>
  );
}
