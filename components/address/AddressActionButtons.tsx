import { Colors, FontSize, Fonts, Radius, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
  return (
    <View style={styles.footer}>
      <TouchableOpacity
        style={[styles.submitButton, (!isValid || isSubmitting) && styles.submitButtonDisabled]}
        disabled={!isValid || isSubmitting}
        onPress={onSubmit}
      >
        <LinearGradient
          colors={(!isValid || isSubmitting) ? [Colors.light.textLight, Colors.light.textLight] : [Colors.light.primary, '#059669']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          {isSubmitting || isLoading ? (
            <ActivityIndicator color={Colors.light.card} />
          ) : (
            <Text style={styles.submitButtonText}>
              {isEditMode ? "Сохранить изменения" : "Сохранить адрес"}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {isEditMode && onDelete && (
        <TouchableOpacity
          style={styles.deleteAddressBtn}
          onPress={() => {
            Alert.alert(
              "Удалить адрес",
              "Вы уверены, что хотите безвозвратно удалить этот адрес доставки?",
              [
                { text: "Отмена", style: "cancel" },
                {
                  text: "Удалить",
                  style: "destructive",
                  onPress: onDelete
                }
              ]
            );
          }}
        >
          <Ionicons name="trash-outline" size={20} color={Colors.light.error} />
          <Text style={styles.deleteAddressText}>Удалить адрес</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: Spacing.l,
    paddingTop: Spacing.m,
    paddingBottom: Platform.OS === 'ios' ? 20 : Spacing.m,
    backgroundColor: Colors.light.background,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
  },
  submitButton: {
    borderRadius: Radius.l,
    height: 56,
    elevation: 8,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  submitButtonDisabled: {
    shadowColor: Colors.light.text,
    shadowOpacity: 0,
    elevation: 0,
  },
  gradientButton: {
    width: '100%',
    height: '100%',
    borderRadius: Radius.l,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: Colors.light.card,
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  deleteAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.m,
    marginTop: Spacing.m,
  },
  deleteAddressText: {
    color: Colors.light.error,
    fontSize: FontSize.m,
    fontWeight: '600',
    marginLeft: Spacing.xs,
    fontFamily: Fonts.sans,
  },
});
