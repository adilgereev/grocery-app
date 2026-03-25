import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Platform, ActivityIndicator, Keyboard, TouchableWithoutFeedback, ScrollView, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAddressStore } from '@/store/addressStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius } from '@/constants/theme';

export default function AddAddressScreen() {
  const { addAddress, isLoading, error, clearError } = useAddressStore();
  const router = useRouter();

  const [street, setStreet] = useState('');
  const [building, setBuilding] = useState('');
  const [entrance, setEntrance] = useState('');
  const [floor, setFloor] = useState('');
  const [apartment, setApartment] = useState('');
  const [intercom, setIntercom] = useState('');
  const [isPrivateHouse, setIsPrivateHouse] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleAddAddress = async () => {
    if (!street.trim()) {
      showAlert('Внимание', 'Пожалуйста, введите название улицы');
      return;
    }

    setIsSubmitting(true);
    clearError();

    try {
      await addAddress({
        text: street.trim(),
        house: building.trim() || undefined,
        entrance: entrance.trim() || undefined,
        floor: floor.trim() || undefined,
        intercom: intercom.trim() || undefined,
        apartment: isPrivateHouse ? undefined : apartment.trim() || undefined,
      });

      showAlert('Готово', 'Адрес успешно добавлен');
      router.back();
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Не удалось добавить адрес';
      console.error('Ошибка добавления адреса:', e);
      showAlert('Ошибка', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Шапка */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Новый адрес</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Улица */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Улица *</Text>
            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              placeholder="Введите название улицы"
              placeholderTextColor={Colors.light.textLight}
              value={street}
              onChangeText={setStreet}
            />
          </View>

          {/* Дом */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Дом</Text>
            <TextInput
              style={styles.input}
              placeholder="Например: 42"
              placeholderTextColor={Colors.light.textLight}
              value={building}
              onChangeText={setBuilding}
              keyboardType="default"
              maxLength={10}
            />
          </View>

          {/* Квартира + тоггл «Частный дом» */}
          {!isPrivateHouse && (
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Квартира</Text>
              <TextInput
                style={styles.input}
                placeholder="Номер квартиры"
                placeholderTextColor={Colors.light.textLight}
                value={apartment}
                onChangeText={setApartment}
                keyboardType="numeric"
              />
            </View>
          )}

          {/* Тоггл частного дома */}
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setIsPrivateHouse(!isPrivateHouse)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, isPrivateHouse && styles.checkboxActive]}>
              {isPrivateHouse && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
            <Text style={styles.checkboxLabel}>Частный дом</Text>
          </TouchableOpacity>

          {/* Подъезд / Этаж / Домофон — только для квартир */}
          {!isPrivateHouse && (
            <View style={styles.rowGroup}>
              <View style={[styles.fieldGroup, { flex: 1, marginRight: Spacing.s }]}>
                <Text style={styles.fieldLabel}>Подъезд</Text>
                <TextInput
                  style={styles.input}
                  placeholder="№"
                  placeholderTextColor={Colors.light.textLight}
                  value={entrance}
                  onChangeText={setEntrance}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.fieldGroup, { flex: 1, marginRight: Spacing.s }]}>
                <Text style={styles.fieldLabel}>Этаж</Text>
                <TextInput
                  style={styles.input}
                  placeholder="№"
                  placeholderTextColor={Colors.light.textLight}
                  value={floor}
                  onChangeText={setFloor}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>Домофон</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Код"
                  placeholderTextColor={Colors.light.textLight}
                  value={intercom}
                  onChangeText={setIntercom}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          )}

          {/* Ошибка из стора */}
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color={Colors.light.error} />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={() => clearError()}>
                <Ionicons name="close" size={18} color={Colors.light.error} />
              </TouchableOpacity>
            </View>
          ) : null}
        </ScrollView>

        {/* Кнопка сохранить */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, (!street.trim() || isSubmitting) && styles.submitButtonDisabled]}
            disabled={!street.trim() || isSubmitting}
            onPress={handleAddAddress}
          >
            {isSubmitting || isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Сохранить адрес</Text>
                <Ionicons name="checkmark" size={20} color="#fff" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: Spacing.l,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: Colors.light.borderLight,
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8,
    zIndex: 10,
  },
  backButton: { padding: Spacing.xs },
  title: { fontSize: 18, fontWeight: '800', color: Colors.light.text },

  scrollContent: { padding: Spacing.l, paddingBottom: 40 },

  // Поле ввода
  fieldGroup: { marginBottom: Spacing.m },
  fieldLabel: {
    fontSize: 13, fontWeight: '700', color: Colors.light.textSecondary,
    marginBottom: Spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#fff',
    height: 54, borderRadius: Radius.m,
    paddingHorizontal: Spacing.m,
    fontSize: 16, color: Colors.light.text,
    borderWidth: 1, borderColor: Colors.light.border,
  },
  inputError: { borderColor: Colors.light.error },

  // Строка из нескольких полей
  rowGroup: { flexDirection: 'row', marginBottom: Spacing.m },

  // Чекбокс «Частный дом»
  checkboxRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.l,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: Colors.light.border,
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.s,
  },
  checkboxActive: { backgroundColor: Colors.light.primary, borderColor: Colors.light.primary },
  checkboxLabel: { fontSize: 15, color: Colors.light.text, fontWeight: '500' },

  // Ошибка
  errorContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: Spacing.m, backgroundColor: '#FEF2F2',
    borderRadius: Radius.m, borderLeftWidth: 4, borderLeftColor: Colors.light.error,
    marginTop: Spacing.s,
  },
  errorText: { flex: 1, fontSize: 14, color: Colors.light.error },

  // Кнопка
  footer: {
    backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: Colors.light.borderLight,
    paddingHorizontal: Spacing.l, paddingTop: Spacing.m,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  submitButton: {
    backgroundColor: Colors.light.primary, borderRadius: Radius.l,
    height: 56, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    elevation: 6, shadowColor: Colors.light.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  submitButtonDisabled: { backgroundColor: Colors.light.textLight, elevation: 0, shadowOpacity: 0 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
