import MapPicker from '@/components/MapPicker';
import ScreenHeader from '@/components/ScreenHeader';
import { AddressActionButtons } from '@/components/address/AddressActionButtons';
import { AddressCommentSection } from '@/components/address/AddressCommentSection';
import { AddressDetailsSection } from '@/components/address/AddressDetailsSection';
import { AddressMainSection } from '@/components/address/AddressMainSection';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { cleanAddress, formatAddressString } from '@/lib/addressUtils';
import { getAddressByCoords } from '@/lib/dadataApi';
import { logger } from '@/lib/logger';
import { AddressFormData, addressSchema } from '@/lib/schemas';
import { useAddressStore } from '@/store/addressStore';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Alert,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddAddressScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditMode = !!id;

  const { addAddress, updateAddress, removeAddress, addresses, isLoading, error, clearError } = useAddressStore();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);

  // Refs для фокуса компактных полей
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

  // Загрузка данных при редактировании
  React.useEffect(() => {
    if (isEditMode && id) {
      const existing = addresses.find((a) => a.id === id);
      if (existing) {
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
      
      // Извлекаем номер дома из сырого адреса для подстраховки
      const houseMatch = rawAddress.match(/д\.\s*(\d+)/);
      const houseNumberFromText = houseMatch ? houseMatch[1] : undefined;

      // Очищаем адрес перед сохранением (убираем город и номер дома из основной строки)
      const cleanStreet = cleanAddress(rawAddress, { removeHouse: true });

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

  const handleDelete = async () => {
    if (id) {
      await removeAddress(id);
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScreenHeader title={isEditMode ? "Редактирование адреса" : "Новый адрес"} />

      <KeyboardAwareScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraHeight={85}
        extraScrollHeight={65}
      >
        <AddressMainSection
          address={address}
          isPrivateHouse={isPrivateHouse}
          onAddressChange={(text) => setValue('text', text, { shouldValidate: true })}
          onHouseChange={(house) => setValue('house', house, { shouldValidate: true })}
          onCoordsChange={(newLat, newLon) => {
            setValue('lat', newLat);
            setValue('lon', newLon);
          }}
          onTogglePrivateHouse={(val) => setValue('is_private_house', val)}
          onOpenMap={() => setMapVisible(true)}
          error={errors.house?.message}
        />

        {!isPrivateHouse && (
          <AddressDetailsSection
            control={control}
            apartmentRef={apartmentRef}
            entranceRef={entranceRef}
            floorRef={floorRef}
            intercomRef={intercomRef}
          />
        )}

        <AddressCommentSection control={control} />

        {error ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={20} color={Colors.light.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => clearError()}>
              <Ionicons name="close" size={18} color={Colors.light.error} />
            </TouchableOpacity>
          </View>
        ) : null}
      </KeyboardAwareScrollView>

      <AddressActionButtons
        isEditMode={isEditMode}
        isValid={isValid}
        isSubmitting={isSubmitting}
        isLoading={isLoading}
        onSubmit={handleSubmit(handleAddAddress)}
        onDelete={isEditMode && id ? handleDelete : undefined}
      />

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
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: Spacing.m, backgroundColor: Colors.light.errorLight,
    borderRadius: Radius.m, borderLeftWidth: 4, borderLeftColor: Colors.light.error,
    marginTop: Spacing.s,
  },
  errorText: { flex: 1, fontSize: 14, color: Colors.light.error },
});

