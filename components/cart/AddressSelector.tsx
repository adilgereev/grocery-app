import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '@/constants/theme';
import { Address } from '@/types';
import { cartSummaryStyles as s } from './CartSummary.styles';

interface AddressSelectorProps {
  selectedAddress?: Address;
  onSelectAddress: () => void;
  disabled: boolean;
  formatAddress: (addr: Address) => string;
}

export default function AddressSelector({
  selectedAddress,
  onSelectAddress,
  disabled,
  formatAddress,
}: AddressSelectorProps) {
  return (
    <>
      <Text style={s.addressLabel}>Куда доставлять?</Text>
      <TouchableOpacity
        style={s.addressSelector}
        onPress={onSelectAddress}
        disabled={disabled}
        activeOpacity={0.7}
        testID="cart-address-selector"
      >
        <View style={s.addressTextContainer}>
          {selectedAddress ? (
            <Text style={s.addressSelectedText} numberOfLines={1}>{formatAddress(selectedAddress)}</Text>
          ) : (
            <Text style={s.addressPlaceholder}>Выберите адрес доставки</Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.light.textLight} />
      </TouchableOpacity>
    </>
  );
}
