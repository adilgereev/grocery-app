import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';

export default function CategoryEmptyState() {
  return <Text style={styles.text}>В этой категории пока нет товаров.</Text>;
}

const styles = StyleSheet.create({
  text: {
    textAlign: 'center',
    marginTop: 60,
    fontSize: 16,
    color: Colors.light.textSecondary,
    paddingHorizontal: Spacing.ml,
  },
});
