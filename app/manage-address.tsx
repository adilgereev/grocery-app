import AddressSearchInput from '@/components/AddressSearchInput';
import MapPicker from '@/components/MapPicker';
import ScreenHeader from '@/components/ScreenHeader';
import { Colors, FontSize, Fonts, Radius, Spacing } from '@/constants/theme';
import { AddressFormData, addressSchema } from '@/lib/schemas';
import { useAddressStore } from '@/store/addressStore';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DaDataSuggestion, getAddressByCoords } from '@/lib/dadataApi';
import { logger } from '@/lib/logger';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';


export default function AddAddressScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditMode = !!id;

  const { addAddress, updateAddress, removeAddress, addresses, isLoading, error, clearError } = useAddressStore();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);

  // Refs для компактных полей
  const apartmentRef = React.useRef<TextInput>(null);
  const entranceRef = React.useRef<TextInput>(null);
  const floorRef = React.useRef<TextInput>(null);
  const intercomRef = React.useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid }
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      text: '',
      is_private_house: false,
    }
  });

  React.useEffect(() => {
    if (isEditMode && id) {
      const existing = addresses.find((a) => a.id === id);
      if (existing) {
        // Формируем полный видимый адрес: улица + дом
        let fullText = existing.text;
        if (existing.house) {
          fullText += `, д. ${existing.house}`;
        }

        reset({
          text: fullText,
          house: existing.house || '',
          entrance: existing.entrance || '',
          floor: existing.floor || '',
          intercom: existing.intercom || '',
          apartment: existing.apartment || '',
          comment: existing.comment || '',
          lat: existing.lat,
          lon: existing.lon,
          is_private_house: !existing.apartment && !!existing.house,
        });
      }
    }
  }, [id, addresses, reset, isEditMode]);

  const address = watch('text');
  const isPrivateHouse = watch('is_private_house');
  const lat = watch('lat');
  const lon = watch('lon');

  // Вспомогательная функция для красивого форматирования адреса
  const formatAddressString = (suggestion: DaDataSuggestion) => {
    const data = suggestion.data;
    if (!data.street_with_type) return suggestion.value;

    if (data.house) {
      return `${data.street_with_type}, д. ${data.house}`;
    }
    return data.street_with_type;
  };

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleAddAddress = async (formData: AddressFormData) => {
    setIsSubmitting(true);
    clearError();

    try {
      const rawAddress = formData.text.trim();

      // Извлекаем номер дома из сырого адреса (если он есть в строке)
      const houseMatch = rawAddress.match(/д\.\s*(\d+)/);
      const houseNumberFromText = houseMatch ? houseMatch[1] : undefined;

      // Очищаем адрес от префиксов (Буйнакск и т.д.)
      let cleanStreet = rawAddress
        .replace(/^г\. Буйнакск,?\s*/i, '')
        .replace(/,?\s*Республика Дагестан$/i, '')
        .replace(/,?\s*Респ\. Дагестан$/i, '')
        .replace(/,?\s*д\.\s*\d+.*$/i, '')
        .trim();

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const payload = {
        text: cleanStreet,
        house: formData.house || houseNumberFromText,
        entrance: formData.entrance?.trim() || undefined,
        floor: formData.floor?.trim() || undefined,
        intercom: formData.intercom?.trim() || undefined,
        apartment: formData.is_private_house ? undefined : formData.apartment?.trim() || undefined,
        comment: formData.comment?.trim() || undefined,
        lat: formData.lat,
        lon: formData.lon,
      };

      if (isEditMode && id) {
        await updateAddress(id, payload);
        showAlert('Готово', 'Адрес успешно обновлен');
      } else {
        await addAddress(payload);
        showAlert('Готово', 'Адрес успешно добавлен');
      }

      router.back();
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Не удалось добавить адрес';
      logger.error('Ошибка добавления адреса:', e);
      showAlert('Ошибка', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader title={isEditMode ? "Редактирование адреса" : "Новый адрес"} />

      <KeyboardAwareScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        // keyboardDismissMode="on-drag"
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraHeight={85}
        extraScrollHeight={65}
      >
        {/* Секция 1: Основной адрес */}
        <View
          style={styles.cardWithZIndex}
        >
          <View style={styles.fieldGroupWithZIndex}>
            <View style={styles.labelRow}>
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
              onChangeText={(text) => {
                setValue('text', text, { shouldValidate: true });
                setValue('house', '', { shouldValidate: true }); // Сбрасываем выбранный дом при ручном вводе
              }}
              onSelect={(suggestion: DaDataSuggestion) => {
                const formatted = formatAddressString(suggestion);
                setValue('text', formatted, { shouldValidate: true });
                if (suggestion.data.geo_lat) {
                  setValue('lat', parseFloat(suggestion.data.geo_lat));
                  setValue('lon', parseFloat(suggestion.data.geo_lon));
                }
                if (suggestion.data.house) {
                  setValue('house', suggestion.data.house, { shouldValidate: true });
                } else {
                  setValue('house', '', { shouldValidate: true });
                }
                Haptics.selectionAsync();
              }}
            />
            {errors.house && (
              <Text style={styles.errorTextInline}>{errors.house.message}</Text>
            )}
          </View>

          {/* Тоггл частного дома */}
          <TouchableOpacity
            style={styles.toggleRowCompact}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setValue('is_private_house', !isPrivateHouse);
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
              <View
                style={[styles.switchThumb, isPrivateHouse && styles.switchThumbActive]}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Секция 2: Детали */}
        {!isPrivateHouse && (
          <View
            style={styles.card}
          >

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
        )}

        {/* Секция 3: Комментарий */}
        <View
          style={styles.card}
        >
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

      {/* Кнопки действий (статичный футер) */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, (!isValid || isSubmitting) && styles.submitButtonDisabled]}
          disabled={!isValid || isSubmitting}
          onPress={handleSubmit(handleAddAddress)}
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
              <>
                <Text style={styles.submitButtonText}>{isEditMode ? "Сохранить изменения" : "Сохранить адрес"}</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {isEditMode && id && (
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
                    onPress: async () => {
                      await removeAddress(id);
                      router.back();
                    }
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

      {/* Модалка карты */}
      <Modal visible={mapVisible} animationType="slide">
        <MapPicker
          initialLocation={lat && lon ? { latitude: lat, longitude: lon } : undefined}
          onClose={() => setMapVisible(false)}
          onLocationSelect={async (newLat, newLon) => {
            setValue('lat', newLat);
            setValue('lon', newLon);
            try {
              const suggestion = await getAddressByCoords(newLat, newLon);
              if (suggestion) {
                const formatted = formatAddressString(suggestion);
                setValue('text', formatted, { shouldValidate: true });
                if (suggestion.data.house) setValue('house', suggestion.data.house);
              }
            } catch (e) {
              logger.error('Ошибка реверсивного геокодинга:', e);
            }
          }}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },

  scrollContainer: { flex: 1 },
  scrollContent: { padding: Spacing.l, paddingBottom: 40, flexGrow: 1 },

  fieldGroupWithZIndex: { marginBottom: Spacing.s, zIndex: 99 },
  fieldLabel: {
    fontSize: 13, fontWeight: '700', color: Colors.light.textSecondary,
    marginBottom: Spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.s },

  rowGroup: { flexDirection: 'row', marginBottom: Spacing.s },
  rowGroupFlex: { flex: 1 },
  rowGroupFlexMargin: { flex: 1, marginRight: Spacing.s },

  card: {
    borderRadius: Radius.xl,
    marginBottom: Spacing.l,
  },
  cardWithZIndex: {
    borderRadius: Radius.xl,
    marginBottom: Spacing.l,
    zIndex: 10,
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
    backgroundColor: Colors.light.card,
    elevation: 2,
    shadowColor: Colors.light.text,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  switchThumbActive: { alignSelf: 'flex-end' },

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

  compactInputWrapper: {
    backgroundColor: Colors.light.card,
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

  errorContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: Spacing.m, backgroundColor: Colors.light.errorLight,
    borderRadius: Radius.m, borderLeftWidth: 4, borderLeftColor: Colors.light.error,
    marginTop: Spacing.s,
  },
  errorText: { flex: 1, fontSize: 14, color: Colors.light.error },
  errorTextInline: { color: Colors.light.error, fontSize: 12, marginTop: 4, fontWeight: '500' },

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
    color: Colors.light.card, fontSize: 16, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.5,
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
