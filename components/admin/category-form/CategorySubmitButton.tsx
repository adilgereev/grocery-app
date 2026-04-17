import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { styles } from './CategoryFormModal.styles';

interface CategorySubmitButtonProps {
  isSubmitting: boolean;
  onPress: () => void;
  isEdit: boolean;
  testID?: string;
}

/**
 * Кнопка отправки формы категории.
 * Вынесена для декомпозиции CategoryFormModal.
 */
export default function CategorySubmitButton({
  isSubmitting,
  onPress,
  isEdit,
  testID,
}: CategorySubmitButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.submitBtn, isSubmitting && styles.btnDisabled]}
      onPress={onPress}
      disabled={isSubmitting}
      activeOpacity={0.8}
      testID={testID}
    >
      {isSubmitting ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.submitBtnText}>
          {isEdit ? 'Сохранить изменения' : 'Создать категорию'}
        </Text>
      )}
    </TouchableOpacity>
  );
}
