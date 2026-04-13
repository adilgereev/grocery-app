// Импортируем полифилл для URL (обязательно для React Native + Supabase)
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

import { env } from '@/config/env';

// Считываем наши ключи из валидированного конфигурационного файла .env
const supabaseUrl = env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Адаптер хранилища на основе AsyncStorage (только нативные платформы)
const customStorage = {
  getItem: (key: string): Promise<string | null> => AsyncStorage.getItem(key),
  setItem: (key: string, value: string): Promise<void> => AsyncStorage.setItem(key, value),
  removeItem: (key: string): Promise<void> => AsyncStorage.removeItem(key),
};

// Инициализируем клиента Supabase с поддержкой типов
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
