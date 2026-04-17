import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Shadows } from '@/constants/theme';

interface CategoryHeaderProps {
  title: string;
  onBackPress: () => void;
}

export default function CategoryHeader({ title, onBackPress }: CategoryHeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.headerRightSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.l,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
    ...Shadows.sm,
    marginBottom: Spacing.s,
    zIndex: 10,
  },
  headerRightSpacer: { width: 24 },
  backButton: {
    padding: Spacing.xs,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.text,
  },
});
