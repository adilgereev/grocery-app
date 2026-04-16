import { Colors, FontSize, Radius, Spacing, Shadows } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AddressActionButtonsProps {
  isEditMode: boolean;
  isValid: boolean;
  isSubmitting: boolean;
  isLoading: boolean;
  onSubmit: () => void;
  onDelete?: () => void;
}

/**
 * Кнопки сохранения и удаления адреса в футере
 */
export const AddressActionButtons: React.FC<AddressActionButtonsProps> = ({
  isEditMode,
  isValid,
  isSubmitting,
  isLoading,
  onSubmit,
  onDelete,
}) => {
  const isDisabled = !isValid || isSubmitting || isLoading;

  return (
    <View style={styles.footer}>
      <TouchableOpacity
        testID="manage-address-save-btn"
        style={[styles.submitButton, isDisabled && styles.submitButtonDisabled]}
        disabled={isDisabled}
        onPress={onSubmit}
        activeOpacity={0.8}
      >
        {isSubmitting || isLoading ? (
          <ActivityIndicator color={Colors.light.white} />
        ) : (
          <Text style={styles.submitButtonText}>
            {isEditMode ? 'Сохранить изменения' : 'Сохранить адрес'}
          </Text>
        )}
      </TouchableOpacity>

      {isEditMode && onDelete && (
        <>
          <View style={styles.deleteSeparator} />
          <TouchableOpacity
            testID="manage-address-delete-btn"
            style={styles.deleteButton}
            onPress={() => {
              Alert.alert(
                'Удалить адрес',
                'Вы уверены, что хотите безвозвратно удалить этот адрес доставки?',
                [
                  { text: 'Отмена', style: 'cancel' },
                  { text: 'Удалить', style: 'destructive', onPress: onDelete },
                ]
              );
            }}
          >
            <Ionicons name="trash-outline" size={18} color={Colors.light.error} />
            <Text style={styles.deleteButtonText}>Удалить адрес</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: Spacing.l,
    paddingTop: Spacing.m,
    paddingBottom: Platform.OS === 'ios' ? 20 : Spacing.m,
    backgroundColor: Colors.light.card,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
  },
  submitButton: {
    height: 56,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.cta,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.light.disabledBackground,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: Colors.light.white,
    fontSize: FontSize.l,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  deleteSeparator: {
    height: 1,
    backgroundColor: Colors.light.borderLight,
    marginTop: Spacing.m,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.m,
    gap: Spacing.xs,
  },
  deleteButtonText: {
    color: Colors.light.error,
    fontSize: FontSize.m,
    fontWeight: '600',
  },
});
