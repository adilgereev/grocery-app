import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Shadows, Spacing } from '@/constants/theme';
import { useCartStore } from '@/store/cartStore';
import { promoCodeSchema } from '@/lib/utils/schemas';

export default function PromoCodeInput() {
  const promoCode = useCartStore((s) => s.promoCode);
  const discount = useCartStore((s) => s.discount);
  const promoError = useCartStore((s) => s.promoError);
  const isValidatingPromo = useCartStore((s) => s.isValidatingPromo);
  const applyPromoCode = useCartStore((s) => s.applyPromoCode);
  const removePromoCode = useCartStore((s) => s.removePromoCode);

  const [inputValue, setInputValue] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleApply = useCallback(() => {
    const result = promoCodeSchema.safeParse(inputValue.trim());
    if (!result.success) {
      setLocalError(result.error.issues?.[0]?.message ?? 'Неверный формат кода');
      return;
    }
    setLocalError(null);
    applyPromoCode(inputValue.trim());
  }, [inputValue, applyPromoCode]);

  const handleRemove = useCallback(() => {
    setInputValue('');
    setLocalError(null);
    removePromoCode();
  }, [removePromoCode]);

  const handleChangeText = useCallback((text: string) => {
    setInputValue(text);
    setLocalError(null);
  }, []);

  const errorMessage = localError ?? promoError;

  if (promoCode) {
    return (
      <View style={styles.appliedRow}>
        <Ionicons name="checkmark-circle" size={20} color={Colors.light.primary} />
        <Text style={styles.appliedText}>{promoCode} — скидка {discount} ₽</Text>
        <TouchableOpacity onPress={handleRemove} hitSlop={8} testID="cart-promo-remove-btn">
          <Ionicons name="close-circle" size={20} color={Colors.light.textSecondary} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={inputValue}
          onChangeText={handleChangeText}
          placeholder="Промокод"
          placeholderTextColor={Colors.light.textSecondary}
          autoCapitalize="characters"
          returnKeyType="done"
          onSubmitEditing={handleApply}
          editable={!isValidatingPromo}
          testID="cart-promo-input"
        />
        <TouchableOpacity
          style={[styles.applyButton, isValidatingPromo && styles.applyButtonDisabled]}
          onPress={handleApply}
          disabled={isValidatingPromo || !inputValue.trim()}
          activeOpacity={0.8}
          testID="cart-promo-apply-btn"
        >
          {isValidatingPromo ? (
            <ActivityIndicator size="small" color={Colors.light.white} />
          ) : (
            <Text style={styles.applyText}>Применить</Text>
          )}
        </TouchableOpacity>
      </View>
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.m,
  },
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.s,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.l,
    color: Colors.light.text,
    fontWeight: '500',
    ...Shadows.sm,
  },
  applyButton: {
    backgroundColor: Colors.light.cta,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 110,
    ...Shadows.sm,
  },
  applyButtonDisabled: {
    opacity: 0.6,
  },
  applyText: {
    color: Colors.light.white,
    fontSize: FontSize.m,
    fontWeight: '700',
  },
  appliedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s,
    backgroundColor: Colors.light.primaryLight,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.m,
  },
  appliedText: {
    flex: 1,
    fontSize: FontSize.m,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  errorText: {
    fontSize: FontSize.s,
    color: Colors.light.error,
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.s,
  },
});
