import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Controller, Control, FieldErrors, FieldValues, Path } from 'react-hook-form';
import { Colors, FontSize, Fonts, Radius, Spacing } from '@/constants/theme';
import { ProfileFormData } from '@/lib/utils/schemas';

interface NameInputsProps<T extends FieldValues> {
  control: Control<T>;
  errors: FieldErrors<ProfileFormData>;
  testIdPrefix?: string;
}

export default function NameInputs<T extends FieldValues>({ control, errors, testIdPrefix = 'profile' }: NameInputsProps<T>) {
  return (
    <>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Имя</Text>
        <Controller
          control={control}
          name={"first_name" as Path<T>}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              testID={`${testIdPrefix}-firstname-input`}
              style={[styles.input, errors.first_name && styles.inputError]}
              placeholder="Например, Иван"
              placeholderTextColor={Colors.light.textLight}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.first_name && (
          <Text style={styles.errorText}>{errors.first_name.message}</Text>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: Spacing.m + Spacing.s,
  },
  label: {
    fontSize: FontSize.m,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginBottom: Spacing.s,
    fontFamily: Fonts.sans,
  },
  input: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.xl,
    padding: Spacing.m,
    fontSize: FontSize.l,
    color: Colors.light.text,
    fontFamily: Fonts.sans,
    textAlignVertical: 'center' as const,
  },
  inputError: {
    borderColor: Colors.light.error,
  },
  errorText: {
    color: Colors.light.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '500',
  },
});
