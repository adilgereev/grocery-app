import Skeleton from '@/components/Skeleton';
import { Colors, FontSize, Fonts, Radius, Spacing } from '@/constants/theme';
import { formatPhoneDisplay } from '@/lib/sms';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditProfileScreen() {
  const router = useRouter();
  const { session } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState(''); // Только для отображения (нередактируемый)

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, phone')
        .eq('id', session?.user.id)
        .single();

      if (error) throw error;

      if (data) {
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setPhone(data.phone || '');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!firstName.trim()) {
      if (Platform.OS === 'web') window.alert('Укажите имя');
      else Alert.alert('Внимание', 'Укажите имя');
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
        })
        .eq('id', session?.user.id);

      if (error) throw error;

      if (Platform.OS === 'web') {
        window.alert('Профиль успешно обновлен!');
      } else {
        Alert.alert('Готово', 'Персональные данные загружены в облако!');
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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={FontSize.xxxl} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Личные данные</Text>
        <View style={{ width: Spacing.xxxl }} />
      </View>

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
              <TextInput
                style={styles.input}
                placeholder="Например, Иван"
                placeholderTextColor={Colors.light.textLight}
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Фамилия</Text>
              <TextInput
                style={styles.input}
                placeholder="Например, Иванов"
                placeholderTextColor={Colors.light.textLight}
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>
        )}

      </KeyboardAwareScrollView>

      <View style={styles.footerInner}>
        <TouchableOpacity
          style={[styles.saveButton, saving && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={saving || loading}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.s + Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
    backgroundColor: Colors.light.card,
  },
  backButton: {
    width: Spacing.xxxl,
    height: Spacing.xxxl,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.light.text,
    fontFamily: Fonts.sans,
  },
  scrollContent: {
    padding: Spacing.l,
  },
  inputGroup: {
    marginBottom: Spacing.m + Spacing.s,
  },
  // Отображение телефона (нередактируемый)
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
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: FontSize.xl,
    fontWeight: '700',
    fontFamily: Fonts.sans,
  },
});
