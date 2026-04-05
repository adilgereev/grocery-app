import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '@/constants/theme';
import { PaymentMethod } from '@/types';
import { cartSummaryStyles as s } from './CartSummary.styles';

const PAYMENT_METHODS: Record<PaymentMethod, { label: string; icon: string; description: string }> = {
  cash: { label: 'Наличными курьеру', icon: 'cash-outline', description: 'Оплата при получении' },
  online: { label: 'Онлайн', icon: 'card', description: 'Списание с карты' },
};

interface PaymentSelectorProps {
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  disabled: boolean;
}

export default function PaymentSelector({
  paymentMethod,
  setPaymentMethod,
  disabled,
}: PaymentSelectorProps) {
  return (
    <>
      <Text style={s.paymentLabel}>Способ оплаты</Text>
      <View style={s.paymentContainer}>
        {(Object.keys(PAYMENT_METHODS) as PaymentMethod[]).map((method) => {
          const isSelected = paymentMethod === method;
          return (
            <TouchableOpacity
              key={method}
              style={[
                s.paymentOption,
                isSelected && s.paymentOptionSelected,
              ]}
              onPress={() => setPaymentMethod(method)}
              disabled={disabled}
              activeOpacity={0.7}
              testID={`payment-method-${method}`}
            >
              <View style={s.paymentIconContainer}>
                <Ionicons
                  name={PAYMENT_METHODS[method].icon as any}
                  size={20}
                  color={isSelected ? Colors.light.primary : Colors.light.textSecondary}
                />
              </View>
              <View style={s.paymentMethodInfo}>
                <Text style={[
                  s.paymentLabelOption,
                  isSelected && s.paymentLabelOptionSelected,
                ]}>
                  {PAYMENT_METHODS[method].label}
                </Text>
                <Text style={s.paymentDescription}>
                  {PAYMENT_METHODS[method].description}
                </Text>
              </View>
              {isSelected && (
                <View style={s.paymentCheckmark}>
                  <Ionicons name="checkmark-circle" size={22} color={Colors.light.primary} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}
