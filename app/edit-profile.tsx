import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, Platform, ScrollView } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import Skeleton from '@/components/Skeleton';

export default function EditProfileScreen() {
  const router = useRouter();
  const { session } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

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
      console.error('Ошибка загрузки профиля:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          phone: phone,
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
      console.error('Ошибка сохранения профиля:', errorMessage);
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
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Личные данные</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        keyboardShouldPersistTaps="handled" 
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets={true}
      >
        {loading ? (
          <View>
            <Skeleton width="100%" height={60} borderRadius={14} style={{ marginBottom: 20 }} />
            <Skeleton width="100%" height={60} borderRadius={14} style={{ marginBottom: 20 }} />
            <Skeleton width="100%" height={60} borderRadius={14} style={{ marginBottom: 20 }} />
          </View>
        ) : (
          <View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email (логин)</Text>
              <TextInput 
                style={[styles.input, styles.disabledInput]} 
                value={session?.user?.email} 
                editable={false} 
              />
              <Text style={styles.helpText}>Для смены адреса почты обратитесь в поддержку</Text>
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Телефон</Text>
              <TextInput 
                style={styles.input} 
                placeholder="+7 (999) 000-00-00"
                placeholderTextColor={Colors.light.textLight}
                keyboardType="phone-pad"
                value={phone} 
                onChangeText={setPhone} 
              />
            </View>
          </View>
        )}

      </ScrollView>

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
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
    backgroundColor: '#fff',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  scrollContent: {
    padding: Spacing.l,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: Spacing.s,
  },
  input: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 14,
    padding: Spacing.m,
    fontSize: 16,
    color: Colors.light.text,
  },
  disabledInput: {
    color: Colors.light.textLight,
    backgroundColor: Colors.light.background,
  },
  helpText: {
    fontSize: 12,
    color: Colors.light.textLight,
    marginTop: 6,
    marginLeft: Spacing.xs,
  },
  footerInner: {
    padding: Spacing.l,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
  },
  saveButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
