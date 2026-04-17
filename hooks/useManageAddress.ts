import { AddressFormData, addressSchema } from '@/lib/utils/schemas';
import { cleanAddress, resolveAddressFromCoords } from '@/lib/utils/addressUtils';
import { logger } from '@/lib/utils/logger';
import { useAddressStore } from '@/store/addressStore';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { useForm } from 'react-hook-form';
import { TextInput } from 'react-native';
import { useToastStore } from '@/store/toastStore';
import { useState } from 'react';

export function useManageAddress() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditMode = !!id;

  const { addAddress, updateAddress, removeAddress, addresses, isLoading, error, clearError } =
    useAddressStore();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);

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
    formState: { errors, isValid },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: { text: '', is_private_house: false },
  });

  React.useEffect(() => {
    if (isEditMode && id) {
      const existing = addresses.find((a) => a.id === id);
      if (existing) {
        let fullText = existing.text;
        if (existing.house) fullText += `, д. ${existing.house}`;
        reset({
          text: fullText,
          house: existing.house || '',
          entrance: existing.entrance || '',
          floor: existing.floor || '',
          intercom: existing.intercom || '',
          apartment: existing.apartment || '',
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

  const handleSubmitAddress = async (formData: AddressFormData) => {
    setIsSubmitting(true);
    clearError();
    try {
      const rawAddress = formData.text.trim();
      const houseMatch = rawAddress.match(/д\.\s*(\d+)/);
      const houseNumberFromText = houseMatch ? houseMatch[1] : undefined;
      const cleanStreet = cleanAddress(rawAddress, { removeHouse: true });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const payload = {
        text: cleanStreet,
        house: formData.house || houseNumberFromText,
        entrance: formData.entrance?.trim() || undefined,
        floor: formData.floor?.trim() || undefined,
        intercom: formData.intercom?.trim() || undefined,
        apartment: formData.is_private_house ? undefined : formData.apartment?.trim() || undefined,
        lat: formData.lat,
        lon: formData.lon,
      };

      if (isEditMode && id) {
        await updateAddress(id, payload);
        useToastStore.getState().showToast('success', 'Адрес успешно обновлен');
      } else {
        await addAddress(payload);
        useToastStore.getState().showToast('success', 'Адрес успешно добавлен');
      }
      router.back();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Не удалось добавить адрес';
      logger.error('Ошибка добавления адреса:', e);
      useToastStore.getState().showToast('error', msg);
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

  const handleMapSelect = async (newLat: number, newLon: number) => {
    setValue('lat', newLat);
    setValue('lon', newLon);
    const resolved = await resolveAddressFromCoords(newLat, newLon);
    if (resolved) {
      setValue('text', resolved.text, { shouldValidate: true });
      if (resolved.house) setValue('house', resolved.house);
    }
  };

  return {
    isEditMode,
    isSubmitting,
    mapVisible,
    setMapVisible,
    control,
    handleSubmit,
    setValue,
    errors,
    isValid,
    address,
    isPrivateHouse,
    lat,
    lon,
    error,
    isLoading,
    clearError,
    apartmentRef,
    entranceRef,
    floorRef,
    intercomRef,
    handleSubmitAddress,
    handleDelete,
    handleMapSelect,
  };
}
