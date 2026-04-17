import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Colors, FontSize, Fonts, Radius, Spacing, Shadows } from '@/constants/theme';

interface SaveButtonProps {
  onPress: () => void;
  saving: boolean;
  loading: boolean;
  label?: string;
  testID?: string;
}

export default function SaveButton({ onPress, saving, loading, label = 'Сохранить', testID = 'profile-save-button' }: SaveButtonProps) {
  return (
    <TouchableOpacity
      testID={testID}
      style={[styles.saveButton, saving && styles.saveButtonSaving]}
      onPress={onPress}
      disabled={saving || loading}
    >
      {saving ? (
        <ActivityIndicator color={Colors.light.white} />
      ) : (
        <Text style={styles.saveButtonText}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  saveButton: {
    backgroundColor: Colors.light.cta,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.m + Spacing.s,
    alignItems: 'center',
    ...Shadows.lg,
  },
  saveButtonSaving: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: Colors.light.white,
    fontSize: FontSize.xl,
    fontWeight: '700',
    fontFamily: Fonts.sans,
  },
});
