import { Colors, Radius, Spacing } from '@/constants/theme';
import { ProductFormData } from '@/lib/utils/schemas';
import React from 'react';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface BasicProductFieldsProps {
  control: Control<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
}

export default function BasicProductFields({ control, errors }: BasicProductFieldsProps) {
  return (
    <>
      <Text style={s.label}>Название товара *</Text>
      <Controller
        control={control}
        name="name"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            style={[s.input, errors.name && s.inputError]}
            placeholder="Например: Стейк Рибай"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />
      {errors.name && <Text style={s.errorText}>{errors.name.message}</Text>}

      <View style={s.row}>
        <View style={s.flex}>
          <Text style={s.label}>Цена (₽) *</Text>
          <Controller
            control={control}
            name="price"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                style={[s.input, errors.price && s.inputError]}
                placeholder="990"
                keyboardType="numeric"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
          {errors.price && <Text style={s.errorText}>{errors.price.message}</Text>}
        </View>
        <View style={s.flex}>
          <Text style={s.label}>Ед. измерения</Text>
          <Controller
            control={control}
            name="unit"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                style={s.input}
                placeholder="1 кг, 500 г, 1 шт"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
        </View>
      </View>
    </>
  );
}

const s = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '600', color: Colors.light.text, marginTop: Spacing.m, marginBottom: 8 },
  input: {
    backgroundColor: Colors.light.background,
    borderRadius: Radius.m,
    padding: Spacing.m,
    fontSize: 16,
    color: Colors.light.text,
  },
  inputError: {
    borderWidth: 1,
    borderColor: Colors.light.error,
  },
  errorText: {
    fontSize: 12,
    color: Colors.light.error,
    marginTop: 4,
  },
  flex: { flex: 1, marginRight: Spacing.s },
  row: { flexDirection: 'row', alignItems: 'center' },
});
