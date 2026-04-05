import Skeleton from '@/components/Skeleton';
import ScreenHeader from '@/components/ScreenHeader';
import { Colors, FontSize, Fonts, Radius, Spacing, Shadows } from '@/constants/theme';
import { formatPhoneDisplay } from '@/lib/sms';
import { fetchUserProfile, updateUserProfile } from '@/lib/authApi';
import { logger } from '@/lib/logger';
import { useAuth } from '@/providers/AuthProvider';

import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, ProfileFormData } from '@/lib/schemas';

export default function EditProfileScreen() {
  const router = useRouter();
  const { session } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [phone, setPhone] = useState(''); // Только для отображения

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
    }
  });

  const fetchProfile = useCallback(async () => {
    try {
      if (!session?.user?.id) return;
      setLoading(true);
      const data = await fetchUserProfile(session.user.id);

      if (data) {
        reset({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
        });
        setPhone(data.phone || '');
      }
    } catch (error: unknown) {
      logger.error('Ошибка в fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  }, [session, reset]);

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
    }
  }, [session, fetchProfile]);

  const onSave = async (formData: ProfileFormData) => {
    if (!session?.user?.id) return;
    try {
      setSaving(true);
      await updateUserProfile(session.user.id, {
        first_name: formData.first_name,
        last_name: formData.last_name || null,
      });

      if (Platform.OS === 'web') {
        window.alert('Профиль успешно обновлен!');
      } else {
        Alert.alert('Готово', 'Персональные данные сохранены!');
      }
      router.back();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      if (Platform.OS === 'web') window.alert(errorMessage);
      else Alert.alert('Ошибка', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScreenHeader title="Личные данные" />

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        extraScrollHeight={Spacing.m}
      >
        {loading ? (
          <View>
            <Skeleton width="100%" height={Spacing.xxxl} borderRadius={Radius.l} style={{ marginBottom: Spacing.m }} />
            <Skeleton width="100%" height={Spacing.xxxl} borderRadius={Radius.l} style={{ marginBottom: Spacing.m }} />
            <Skeleton width="100%" height={Spacing.xxxl} borderRadius={Radius.l} style={{ marginBottom: Spacing.m }} />
          </View>
        ) : (
          <View>
            {/* Телефон (нередактируемый) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Телефон</Text>
              <View style={styles.phoneDisplay}>
                <Text style={styles.phoneText}>
                  {phone ? formatPhoneDisplay(phone) : 'Не указан'}
                </Text>
              </View>
              <Text style={styles.phoneHint}>
                Для изменения номера обратитесь в поддержку
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Имя</Text>
              <Controller
                control={control}
                name="first_name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    testID="profile-firstname-input"
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Фамилия (необязательно)</Text>
              <Controller
                control={control}
                name="last_name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    testID="profile-lastname-input"
                    style={[styles.input, errors.last_name && styles.inputError]}
                    placeholder="Например, Иванов"
                    placeholderTextColor={Colors.light.textLight}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value || ''}
                  />
                )}
              />
              {errors.last_name && (
                <Text style={styles.errorText}>{errors.last_name.message}</Text>
              )}
            </View>
          </View>
        )}

      </KeyboardAwareScrollView>

      <View style={styles.footerInner}>
        <TouchableOpacity
          testID="profile-save-button"
          style={[styles.saveButton, saving && styles.saveButtonSaving]}
          onPress={handleSubmit(onSave)}
          disabled={saving || loading}
        >
          {saving ? (
            <ActivityIndicator color={Colors.light.card} />
          ) : (
            <Text style={styles.saveButtonText}>Сохранить</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.card,
  },
  scrollContent: {
    padding: Spacing.l,
  },
  inputGroup: {
    marginBottom: Spacing.m + Spacing.s,
  },
  phoneDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.disabledBackground,
    borderRadius: Radius.l,
    padding: Spacing.m,
  },
  phoneText: {
    flex: 1,
    fontSize: FontSize.l,
    fontWeight: '600',
    color: Colors.light.disabledText,
    fontFamily: Fonts.sans,
  },
  phoneHint: {
    fontSize: FontSize.s,
    color: Colors.light.textSecondary,
    fontWeight: '500',
    fontFamily: Fonts.sans,
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
  footerInner: {
    padding: Spacing.l,
    backgroundColor: Colors.light.card,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
  },
  saveButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.m + Spacing.s,
    alignItems: 'center',
    ...Shadows.lg,
  },
  saveButtonSaving: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: Colors.light.card,
    fontSize: FontSize.xl,
    fontWeight: '700',
    fontFamily: Fonts.sans,
  },
});

