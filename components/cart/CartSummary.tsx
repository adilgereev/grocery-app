import React from 'react';
import { View } from 'react-native';

import { Address, PaymentMethod } from '@/types';
import AddressSelector from '@/components/cart/AddressSelector';
import PaymentSelector from '@/components/cart/PaymentSelector';
import OrderReceipt from '@/components/cart/OrderReceipt';
import CheckoutButton from '@/components/cart/CheckoutButton';
import { cartSummaryStyles as s } from '@/components/cart/CartSummary.styles';

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
    <View style={s.listFooter}>
      <AddressSelector
        selectedAddress={selectedAddress}
        onSelectAddress={onSelectAddress}
        disabled={isSubmitting}
        formatAddress={formatAddress}
      />

      <PaymentSelector
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        disabled={isSubmitting}
      />

      <OrderReceipt
        itemsCount={itemsCount}
        subtotal={subtotal}
        deliveryFee={deliveryFee}
        totalPrice={totalPrice}
      />

      <CheckoutButton
        totalPrice={totalPrice}
        isSubmitting={isSubmitting}
        onCheckout={onCheckout}
      />
    </View>
  );
}
