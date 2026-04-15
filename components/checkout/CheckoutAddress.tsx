import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, FontSize, Radius, Shadows, Spacing } from '@/constants/theme';
import { Address } from '@/types';

interface CheckoutAddressProps {
  selectedAddress?: Address;
  onSelectAddress: () => void;
  disabled: boolean;
  formatAddress: (addr: Address) => string;
}

/**
 * Секция выбора адреса доставки на экране оформления заказа.
 */
export default function CheckoutAddress({
  selectedAddress,
  onSelectAddress,
  disabled,
  formatAddress,
}: CheckoutAddressProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionLabel}>КУДА ДОСТАВИТЬ</Text>
      <TouchableOpacity
        style={styles.card}
        onPress={onSelectAddress}
        disabled={disabled}
        activeOpacity={0.7}
        testID="checkout-address-selector"
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="location-outline" size={22} color={Colors.light.primary} />
          </View>
          <View style={styles.textContainer}>
            {selectedAddress ? (
              <Text style={styles.addressText} numberOfLines={2}>
                {formatAddress(selectedAddress)}
              </Text>
            ) : (
              <Text style={styles.placeholder}>Выберите адрес доставки</Text>
            )}
          </View>
        </View>
        <View style={styles.changeButton}>
          <Text style={styles.changeText}>
            {selectedAddress ? 'Изменить' : 'Выбрать'}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.light.primary} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
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
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: Radius.xxl,
    padding: Spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  addressText: {
    fontSize: FontSize.l,
    color: Colors.light.text,
    fontWeight: '600',
    lineHeight: 20,
  },
  placeholder: {
    fontSize: FontSize.l,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  changeText: {
    fontSize: FontSize.m,
    color: Colors.light.primary,
    fontWeight: '600',
  },
});
