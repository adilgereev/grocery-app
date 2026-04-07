import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Colors, Fonts, Radius, Shadows, Spacing } from '@/constants/theme';
import { profileSchema, ProfileFormData } from '@/lib/utils/schemas';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/services/supabase';
import { logger } from '@/lib/utils/logger';

export default function SetupProfileScreen() {
  const { session, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { first_name: '', last_name: '' },
  });

  const onSave = async (formData: ProfileFormData) => {
    if (!session?.user?.id) return;
    try {
      setSaving(true);
      setError(null);
      // Телефон из сессии (обязательное поле NOT NULL в БД)
      const phone = session.user.user_metadata?.phone || session.user.phone || '';

      // Используем upsert — профиль может ещё не существовать в БД
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          first_name: formData.first_name,
          last_name: formData.last_name || null,
          phone,
        });

      if (upsertError) throw upsertError;
      // Обновляем профиль в контексте → layout перенаправит в табы
      await refreshProfile();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Произошла ошибка';
      setError(msg);
      logger.error('Ошибка сохранения профиля:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.light.primaryLight, Colors.light.white]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        extraScrollHeight={Spacing.m}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.innerContainer}>
            {/* Шапка — как на экране логина */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Ionicons name="person" size={40} color={Colors.light.white} />
              </View>
              <Text style={styles.appName}>Как вас зовут?</Text>
              <Text style={styles.subtitle}>
                Представьтесь, чтобы мы могли обращаться к вам по имени
              </Text>
            </View>

            {/* Стеклянная карточка — как на экране логина */}
            <View style={styles.card}>
              {/* Поле "Имя" */}
              <View style={styles.inputGroup}>
                <Text style={styles.formTitle}>Имя</Text>
                <Controller
                  control={control}
                  name="first_name"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      testID="setup-firstname-input"
                      style={[styles.input, errors.first_name && styles.inputError]}
                      placeholder="Например, Иван"
                      placeholderTextColor={Colors.light.textLight}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      autoFocus
                    />
                  )}
                />
                {errors.first_name && (
                  <Text style={styles.errorText}>{errors.first_name.message}</Text>
                )}
              </View>

              {/* Поле "Фамилия" */}
              <View style={styles.inputGroup}>
                <Text style={styles.formTitle}>Фамилия (необязательно)</Text>
                <Controller
                  control={control}
                  name="last_name"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      testID="setup-lastname-input"
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

              {/* Общая ошибка сохранения */}
              {error && <Text style={styles.errorText}>{error}</Text>}

              {/* Кнопка */}
              <TouchableOpacity
                testID="setup-continue-button"
                style={[styles.primaryButton, saving && styles.primaryButtonDisabled]}
                onPress={handleSubmit(onSave)}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={Colors.light.white} />
                ) : (
                  <Text style={styles.primaryButtonText}>Продолжить</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.white,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  innerContainer: {
    paddingBottom: 60,
  },

  // Шапка — как на экране логина
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingTop: 60,
    paddingHorizontal: Spacing.l,
  },
  logoContainer: {
    width: 84,
    height: 84,
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.xxl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.m,
    ...Shadows.md,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.text,
    letterSpacing: 0.5,
    marginBottom: 4,
    fontFamily: Fonts.sans,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
    fontFamily: Fonts.sans,
  },

  // Стеклянная карточка — как на экране логина
  card: {
    backgroundColor: Colors.light.glassBackground,
    marginHorizontal: Spacing.m,
    borderRadius: Radius.xxl + 4,
    padding: Spacing.xl,
    ...Shadows.lg,
    borderWidth: 1.5,
    borderColor: Colors.light.glassBorder,
  },

  // Поля формы
  inputGroup: {
    marginBottom: Spacing.l,
  },
  formTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginBottom: Spacing.s,
    fontFamily: Fonts.sans,
  },
  input: {
    backgroundColor: Colors.light.background,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: Radius.m,
    paddingHorizontal: Spacing.m,
    height: 52,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    fontFamily: Fonts.sans,
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

  // Кнопка — как на экране логина
  primaryButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.m,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.s,
    ...Shadows.sm,
  },
  primaryButtonDisabled: {
    backgroundColor: Colors.light.primaryLight,
  },
  primaryButtonText: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Fonts.sans,
  },
});
