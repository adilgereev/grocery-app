import { Colors, FontSize, Radius, Spacing, Shadows } from '@/constants/theme';
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
    <View style={styles.wrapper}>
      <Text style={styles.sectionTitle}>Детали квартиры</Text>
      <View style={styles.card}>
        <View style={styles.rowGroup}>
          <View style={styles.cellLeft}>
            <Pressable
              style={styles.inputCell}
              onPress={() => apartmentRef.current?.focus()}
            >
              <Text style={styles.cellLabel}>КВАРТИРА</Text>
              <Controller
                control={control}
                name="apartment"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    ref={apartmentRef}
                    style={styles.cellInput}
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
          <View style={styles.cellRight}>
            <Pressable
              style={styles.inputCell}
              onPress={() => entranceRef.current?.focus()}
            >
              <Text style={styles.cellLabel}>ПОДЪЕЗД</Text>
              <Controller
                control={control}
                name="entrance"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    ref={entranceRef}
                    style={styles.cellInput}
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

        <View style={styles.rowDivider} />

        <View style={styles.rowGroup}>
          <View style={styles.cellLeft}>
            <Pressable
              style={styles.inputCell}
              onPress={() => floorRef.current?.focus()}
            >
              <Text style={styles.cellLabel}>ЭТАЖ</Text>
              <Controller
                control={control}
                name="floor"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    ref={floorRef}
                    style={styles.cellInput}
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
          <View style={styles.cellRight}>
            <Pressable
              style={styles.inputCell}
              onPress={() => intercomRef.current?.focus()}
            >
              <Text style={styles.cellLabel}>ДОМОФОН</Text>
              <Controller
                control={control}
                name="intercom"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    ref={intercomRef}
                    style={styles.cellInput}
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
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.m,
  },
  sectionTitle: {
    fontSize: FontSize.s,
    fontWeight: '700',
    color: Colors.light.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.s,
    paddingLeft: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  rowGroup: {
    flexDirection: 'row',
  },
  rowDivider: {
    height: 1,
    backgroundColor: Colors.light.borderLight,
  },
  cellLeft: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: Colors.light.borderLight,
  },
  cellRight: {
    flex: 1,
  },
  inputCell: {
    padding: Spacing.m,
    height: 72,
    justifyContent: 'center',
  },
  cellLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs,
    letterSpacing: 0.3,
  },
  cellInput: {
    fontSize: FontSize.l,
    fontWeight: '600',
    color: Colors.light.text,
    padding: 0,
  },
});
