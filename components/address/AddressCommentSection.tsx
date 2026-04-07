import { Colors, Radius, Spacing } from '@/constants/theme';
import { AddressFormData } from '@/lib/utils/schemas';
import React from 'react';
import { Control, Controller } from 'react-hook-form';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface AddressCommentSectionProps {
  control: Control<AddressFormData>;
}

/**
 * Секция для ввода комментария курьеру
 */
export const AddressCommentSection: React.FC<AddressCommentSectionProps> = ({ control }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionSubtitle}>КОММЕНТАРИЙ ДЛЯ КУРЬЕРА</Text>
      <View style={styles.commentInputContainer}>
        <Controller
          control={control}
          name="comment"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.commentInput}
              placeholder="Например: код от ворот 123, оставить у двери..."
              placeholderTextColor={Colors.light.textLight}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value || ''}
              multiline
              numberOfLines={3}
              keyboardAppearance="light"
            />
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    marginBottom: Spacing.l,
  },
  sectionSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.textSecondary,
    letterSpacing: 1.5,
    marginBottom: Spacing.s,
    textTransform: 'uppercase',
  },
  commentInputContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.light.card,
    borderRadius: Radius.m,
    height: 100,
    paddingHorizontal: Spacing.m,
    alignItems: 'flex-start',
    paddingTop: 12,
  },
  commentInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    height: '100%',
    textAlignVertical: 'top',
  },
});
