import React from 'react';
import { Text, View } from 'react-native';
import { cartSummaryStyles as s } from './CartSummary.styles';

interface OrderReceiptProps {
  itemsCount: number;
  subtotal: number;
  deliveryFee: number;
  totalPrice: number;
}

export default function OrderReceipt({
  itemsCount,
  subtotal,
  deliveryFee,
  totalPrice,
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

      <View style={s.receiptDivider} />

      <View style={s.receiptRowTotal}>
        <Text style={s.receiptTotalLabel}>Итого</Text>
        <Text style={s.receiptTotalPrice}>{totalPrice.toFixed(0)} ₽</Text>
      </View>
    </View>
  );
}
