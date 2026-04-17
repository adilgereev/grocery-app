import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, Radius, Shadows } from '@/constants/theme';

interface AddressFooterProps {
  onAdd: () => void;
}

export function AddressFooter({ onAdd }: AddressFooterProps) {
  return (
    <View style={styles.footer}>
      <TouchableOpacity
        testID="address-add-button"
        style={styles.addButton}
        onPress={onAdd}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={24} color={Colors.light.white} style={styles.addIcon} />
        <Text style={styles.addButtonText}>Добавить новый адрес</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    padding: Spacing.l,
    paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.l,
    backgroundColor: Colors.light.card,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: Colors.light.cta,
    borderRadius: Radius.pill,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },
  addIcon: { marginRight: Spacing.s },
  addButtonText: {
    color: Colors.light.white,
    fontSize: FontSize.l,
    fontWeight: '700',
  },
});
