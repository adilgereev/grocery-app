import { Colors, Radius, Spacing } from '@/constants/theme';
import { AddressFormData } from '@/lib/utils/schemas';
import React from 'react';
import { Control, Controller } from 'react-hook-form';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

interface AddressDetailsSectionProps {
  control: Control<AddressFormData>;
  apartmentRef: React.RefObject<TextInput | null>;
  entranceRef: React.RefObject<TextInput | null>;
  floorRef: React.RefObject<TextInput | null>;
  intercomRef: React.RefObject<TextInput | null>;
}

/**
 * Секция с деталями адреса (квартира, подъезд, этаж, домофон) в виде сетки
 */
export const AddressDetailsSection: React.FC<AddressDetailsSectionProps> = ({
  control,
  apartmentRef,
  entranceRef,
  floorRef,
  intercomRef,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.rowGroup}>
        <View style={styles.rowGroupFlexMargin}>
          <Pressable
            style={styles.compactInputWrapper}
            onPress={() => apartmentRef.current?.focus()}
          >
            <Text style={styles.compactLabel}>КВАРТИРА</Text>
            <Controller
              control={control}
              name="apartment"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  ref={apartmentRef}
                  style={styles.compactInput}
                  placeholder="№"
                  placeholderTextColor={Colors.light.textLight}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value || ''}
                  keyboardType="numeric"
                  keyboardAppearance="light"
                />
              )}
            />
          </Pressable>
        </View>
        <View style={styles.rowGroupFlex}>
          <Pressable
            style={styles.compactInputWrapper}
            onPress={() => entranceRef.current?.focus()}
          >
            <Text style={styles.compactLabel}>ПОДЪЕЗД</Text>
            <Controller
              control={control}
              name="entrance"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  ref={entranceRef}
                  style={styles.compactInput}
                  placeholder="№"
                  placeholderTextColor={Colors.light.textLight}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value || ''}
                  keyboardType="numeric"
                  keyboardAppearance="light"
                />
              )}
            />
          </Pressable>
        </View>
      </View>

      <View style={styles.rowGroup}>
        <View style={styles.rowGroupFlexMargin}>
          <Pressable
            style={styles.compactInputWrapper}
            onPress={() => floorRef.current?.focus()}
          >
            <Text style={styles.compactLabel}>ЭТАЖ</Text>
            <Controller
              control={control}
              name="floor"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  ref={floorRef}
                  style={styles.compactInput}
                  placeholder="№"
                  placeholderTextColor={Colors.light.textLight}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value || ''}
                  keyboardType="numeric"
                  keyboardAppearance="light"
                />
              )}
            />
          </Pressable>
        </View>
        <View style={styles.rowGroupFlex}>
          <Pressable
            style={styles.compactInputWrapper}
            onPress={() => intercomRef.current?.focus()}
          >
            <Text style={styles.compactLabel}>ДОМОФОН</Text>
            <Controller
              control={control}
              name="intercom"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  ref={intercomRef}
                  style={styles.compactInput}
                  placeholder="Код"
                  placeholderTextColor={Colors.light.textLight}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value || ''}
                  keyboardType="default"
                  keyboardAppearance="light"
                />
              )}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    marginBottom: Spacing.l,
  },
  rowGroup: { flexDirection: 'row', marginBottom: Spacing.s },
  rowGroupFlex: { flex: 1 },
  rowGroupFlexMargin: { flex: 1, marginRight: Spacing.s },
  compactInputWrapper: {
    backgroundColor: Colors.light.card,
    borderRadius: Radius.m,
    padding: 10,
    height: 68,
    justifyContent: 'center',
  },
  compactLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.light.textSecondary,
    marginBottom: 2,
  },
  compactInput: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
    padding: 0,
  },
});
