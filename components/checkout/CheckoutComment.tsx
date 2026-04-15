import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors, FontSize, Radius, Shadows, Spacing } from '@/constants/theme';

interface CheckoutCommentProps {
  value: string;
  onChangeText: (text: string) => void;
  disabled: boolean;
}

/**
 * Карточка ввода комментария к заказу на экране оформления.
 */
export default function CheckoutComment({ value, onChangeText, disabled }: CheckoutCommentProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>КОММЕНТАРИЙ К ЗАКАЗУ</Text>
      <TextInput
        style={styles.input}
        placeholder="Позвоните за 10 мин, замены не нужны..."
        placeholderTextColor={Colors.light.textLight}
        value={value}
        onChangeText={onChangeText}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        keyboardAppearance="light"
        editable={!disabled}
        testID="checkout-comment-input"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: Radius.xxl,
    padding: Spacing.m,
    marginBottom: Spacing.m,
    ...Shadows.sm,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.light.textSecondary,
    letterSpacing: 1.5,
    marginBottom: Spacing.s,
  },
  input: {
    fontSize: FontSize.l,
    color: Colors.light.text,
    minHeight: 72,
    textAlignVertical: 'top',
  },
});
