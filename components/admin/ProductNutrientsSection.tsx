import { Colors, Radius, Spacing } from '@/constants/theme';
import { ProductFormData } from '@/lib/utils/schemas';
import React from 'react';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface ProductNutrientsSectionProps {
  control: Control<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
}

export default function ProductNutrientsSection({ control, errors }: ProductNutrientsSectionProps) {
  return (
    <>
      <Text style={s.sectionHeader}>КБЖУ (на 100 г)</Text>
      <View style={s.row}>
        <View style={s.flex}>
          <Text style={s.label}>Калории (ккал)</Text>
          <Controller
            control={control}
            name="calories"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                style={[s.input, errors.calories && s.inputError]}
                placeholder="0"
                keyboardType="numeric"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                testID="product-form-calories-input"
              />
            )}
          />
          {errors.calories && <Text style={s.errorText}>{errors.calories.message}</Text>}
        </View>
        <View style={s.flex}>
          <Text style={s.label}>Белки (г)</Text>
          <Controller
            control={control}
            name="proteins"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                style={[s.input, errors.proteins && s.inputError]}
                placeholder="0"
                keyboardType="numeric"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                testID="product-form-proteins-input"
              />
            )}
          />
          {errors.proteins && <Text style={s.errorText}>{errors.proteins.message}</Text>}
        </View>
      </View>
      <View style={s.row}>
        <View style={s.flex}>
          <Text style={s.label}>Жиры (г)</Text>
          <Controller
            control={control}
            name="fats"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                style={[s.input, errors.fats && s.inputError]}
                placeholder="0"
                keyboardType="numeric"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                testID="product-form-fats-input"
              />
            )}
          />
          {errors.fats && <Text style={s.errorText}>{errors.fats.message}</Text>}
        </View>
        <View style={s.flex}>
          <Text style={s.label}>Углеводы (г)</Text>
          <Controller
            control={control}
            name="carbohydrates"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                style={[s.input, errors.carbohydrates && s.inputError]}
                placeholder="0"
                keyboardType="numeric"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                testID="product-form-carbohydrates-input"
              />
            )}
          />
          {errors.carbohydrates && <Text style={s.errorText}>{errors.carbohydrates.message}</Text>}
        </View>
      </View>
    </>
  );
}

const s = StyleSheet.create({
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.textSecondary,
    marginTop: Spacing.xl,
    marginBottom: 4,
    paddingTop: Spacing.m,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
  },
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
