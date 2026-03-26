import AddressSearchInput from '@/components/AddressSearchInput';
import MapPicker from '@/components/MapPicker';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAddressStore } from '@/store/addressStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DaDataSuggestion, getAddressByCoords } from '@/lib/dadataApi';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeOutUp, Layout } from 'react-native-reanimated';

export default function AddAddressScreen() {
  const { addAddress, isLoading, error, clearError } = useAddressStore();
  const router = useRouter();

  const [address, setAddress] = useState('');
  const [entrance, setEntrance] = useState('');
  const [floor, setFloor] = useState('');
  const [apartment, setApartment] = useState('');
  const [intercom, setIntercom] = useState('');
  const [comment, setComment] = useState('');
  const [isPrivateHouse, setIsPrivateHouse] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

  // Вспомогательная функция для красивого форматирования адреса
  const formatAddressString = (suggestion: DaDataSuggestion) => {
    const data = suggestion.data;
    if (!data.street_with_type) return suggestion.value;

    let base = `${data.street_with_type}`;
    if (data.house) {
      base += `, д. ${data.house}`;
    } else {
      base += ', ';
    }
    return base;
  };

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleAddAddress = async () => {
    if (!address.trim()) {
      showAlert('Внимание', 'Пожалуйста, введите адрес');
      return;
    }

    setIsSubmitting(true);
    clearError();

    try {
      const fullAddress = address.trim().startsWith('г. Буйнакск')
        ? address.trim()
        : `г. Буйнакск, ${address.trim()}`;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      await addAddress({
        text: fullAddress,
        house: undefined,
        entrance: entrance.trim() || undefined,
        floor: floor.trim() || undefined,
        intercom: intercom.trim() || undefined,
        apartment: isPrivateHouse ? undefined : apartment.trim() || undefined,
        comment: comment.trim() || undefined,
        // Сохраняем координаты если есть
        lat: coords?.lat,
        lon: coords?.lon,
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

        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          extraScrollHeight={80}
          enableOnAndroid={true}
        >
          {/* Секция 1: Основной адрес */}
          <Animated.View
            entering={FadeInDown.duration(400)}
            style={[styles.card, { zIndex: 10 }]}
          >
            <View style={[styles.fieldGroup, { zIndex: 99 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.s }}>
                <View style={styles.labelWithIcon}>
                  <Ionicons name="location-sharp" size={18} color={Colors.light.primary} />
                  <Text style={styles.fieldLabel}>Адрес доставки*</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setMapVisible(true);
                  }}
                  style={styles.mapLink}
                >
                  <Ionicons name="map" size={16} color={Colors.light.primary} />
                  <Text style={styles.mapLinkText}>На карте</Text>
                </TouchableOpacity>
              </View>
              <AddressSearchInput
                city="Буйнакск"
                initialValue={address}
                onSelect={(suggestion: DaDataSuggestion) => {
                  setAddress(formatAddressString(suggestion));
                  if (suggestion.data.geo_lat) setCoords({ lat: parseFloat(suggestion.data.geo_lat), lon: parseFloat(suggestion.data.geo_lon) });
                  Haptics.selectionAsync();
                }}
              />
            </View>

            {/* Тоггл частного дома - встроен в карточку */}
            <TouchableOpacity
              style={styles.toggleRowCompact}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setIsPrivateHouse(!isPrivateHouse);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.toggleTextContainer}>
                <Ionicons
                  name={isPrivateHouse ? "home" : "business"}
                  size={20}
                  color={isPrivateHouse ? Colors.light.primary : Colors.light.textSecondary}
                />
                <Text style={styles.toggleLabel}>Частный дом</Text>
              </View>
              <View style={[styles.switchBase, isPrivateHouse && styles.switchActive]}>
                <Animated.View
                  layout={Layout.springify()}
                  style={[styles.switchThumb, isPrivateHouse && styles.switchThumbActive]}
                />
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Секция 2: Детали (только если не частный дом) */}
          {!isPrivateHouse && (
            <Animated.View
              entering={FadeInDown.delay(100).duration(400)}
              exiting={FadeOutUp.duration(300)}
              style={styles.card}
            >
              <Text style={styles.sectionSubtitle}>ДЕТАЛИ АДРЕСА</Text>

              <View style={styles.rowGroup}>
                <View style={[styles.fieldGroup, { flex: 1, marginRight: Spacing.s }]}>
                  <View style={styles.compactInputWrapper}>
                    <Text style={styles.compactLabel}>КВАРТИРА</Text>
                    <TextInput
                      style={styles.compactInput}
                      placeholder="№"
                      placeholderTextColor={Colors.light.textLight}
                      value={apartment}
                      onChangeText={setApartment}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <View style={styles.compactInputWrapper}>
                    <Text style={styles.compactLabel}>ПОДЪЕЗД</Text>
                    <TextInput
                      style={styles.compactInput}
                      placeholder="№"
                      placeholderTextColor={Colors.light.textLight}
                      value={entrance}
                      onChangeText={setEntrance}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>

              <View style={styles.rowGroup}>
                <View style={[styles.fieldGroup, { flex: 1, marginRight: Spacing.s }]}>
                  <View style={styles.compactInputWrapper}>
                    <Text style={styles.compactLabel}>ЭТАЖ</Text>
                    <TextInput
                      style={styles.compactInput}
                      placeholder="№"
                      placeholderTextColor={Colors.light.textLight}
                      value={floor}
                      onChangeText={setFloor}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <View style={styles.compactInputWrapper}>
                    <Text style={styles.compactLabel}>ДОМОФОН</Text>
                    <TextInput
                      style={styles.compactInput}
                      placeholder="Код"
                      placeholderTextColor={Colors.light.textLight}
                      value={intercom}
                      onChangeText={setIntercom}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>
            </Animated.View>
          )}

          {/* Секция 3: Комментарий */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(400)}
            style={styles.card}
          >
            <Text style={styles.sectionSubtitle}>КОММЕНТАРИЙ ДЛЯ КУРЬЕРА</Text>
            <View style={[styles.inputWithIcon, { height: 100, alignItems: 'flex-start', paddingTop: 12 }]}>
              <TextInput
                style={[styles.cleanInput, { textAlignVertical: 'top' }]}
                placeholder="Например: код от ворот 123, оставить у двери..."
                placeholderTextColor={Colors.light.textLight}
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={3}
              />
            </View>
          </Animated.View>

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
        </KeyboardAwareScrollView>

        {/* Кнопка сохранить */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, (!address.trim() || isSubmitting) && styles.submitButtonDisabled]}
            disabled={!address.trim() || isSubmitting}
            onPress={handleAddAddress}
          >
            <LinearGradient
              colors={(!address.trim() || isSubmitting) ? [Colors.light.textLight, Colors.light.textLight] : ['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              {isSubmitting || isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Сохранить адрес</Text>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginLeft: 8 }} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Модалка карты */}
        <Modal visible={mapVisible} animationType="slide">
          <MapPicker
            initialLocation={coords ? { latitude: coords.lat, longitude: coords.lon } : undefined}
            onClose={() => setMapVisible(false)}
            onLocationSelect={async (lat, lon) => {
              setCoords({ lat, lon });
              try {
                const suggestion = await getAddressByCoords(lat, lon);
                if (suggestion) {
                  setAddress(formatAddressString(suggestion));
                }
              } catch (e) {
                console.error('Ошибка реверсивного геокодинга:', e);
              }
            }}
          />
        </Modal>
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
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8,
    zIndex: 10,
  },
  backButton: {
    padding: Spacing.s,
    backgroundColor: Colors.light.borderLight,
    borderRadius: Radius.m,
  },
  title: { fontSize: 20, fontWeight: '900', color: Colors.light.text },

  scrollContent: { padding: Spacing.l, paddingBottom: 40 },

  fieldGroup: { marginBottom: Spacing.s },
  fieldLabel: {
    fontSize: 13, fontWeight: '700', color: Colors.light.textSecondary,
    marginBottom: Spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5,
  },

  rowGroup: { flexDirection: 'row', marginBottom: Spacing.s },

  // Карточки
  card: {
    borderRadius: Radius.xl,
    marginBottom: Spacing.l,
  },
  labelWithIcon: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionSubtitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.light.textSecondary,
    letterSpacing: 1.5,
    marginBottom: Spacing.s,
    textTransform: 'uppercase',
  },

  // Кастомный переключатель
  toggleRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
    paddingTop: Spacing.s,
  },
  toggleTextContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  toggleLabel: { fontSize: 15, fontWeight: '600', color: Colors.light.text },
  switchBase: {
    width: 46,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.light.border,
    padding: 3,
  },
  switchActive: { backgroundColor: Colors.light.primary },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  switchThumbActive: { alignSelf: 'flex-end' },

  // Инпуты с иконками
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: Radius.m,
    height: 56,
    paddingHorizontal: Spacing.m,
  },
  cleanInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    height: '100%',
  },

  // Компактные инпуты для ряда
  compactInputWrapper: {
    backgroundColor: '#fff',
    borderRadius: Radius.m,
    padding: 10,
    height: 68,
    justifyContent: 'center',
  },
  compactLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.light.textSecondary,
    marginBottom: 2,
  },
  compactInput: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
    padding: 0,
  },

  // Ошибка
  errorContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: Spacing.m, backgroundColor: '#FEF2F2',
    borderRadius: Radius.m, borderLeftWidth: 4, borderLeftColor: Colors.light.error,
    marginTop: Spacing.s,
  },
  errorText: { flex: 1, fontSize: 14, color: Colors.light.error },

  // Футер и Кнопка
  footer: {
    backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: Colors.light.borderLight,
    paddingHorizontal: Spacing.l, paddingTop: Spacing.m,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  submitButton: {
    borderRadius: Radius.l,
    height: 56,
    elevation: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    backgroundColor: 'transparent',
  },
  submitButtonDisabled: {
    shadowColor: '#000',
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
  submitButtonText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },

  mapLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.light.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.m,
  },
  mapLinkText: { fontSize: 13, color: Colors.light.primary, fontWeight: '800' },
});
