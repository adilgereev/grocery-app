import { supabase } from '@/lib/services/supabase';
import { Profile } from '@/types';
import { Session } from '@supabase/supabase-js';

import { generatePasswordFromPhone, phoneToEmail } from '@/lib/utils/authUtils';

/**
 * Получение профиля пользователя по ID
 */
export async function fetchUserProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Обновление профиля пользователя
 */
export async function updateUserProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Получение текущей сессии
 */
export async function getSession(): Promise<Session | null> {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

/**
 * Генерирует и отправляет OTP через Edge Function.
 * В DEV-режиме (DEV_MODE=true на сервере) возвращает код в ответе — SMS не уходит.
 * В PROD-режиме SMS отправляется через SMS.ru, код в ответе отсутствует.
 */
export async function sendOtp(phone: string): Promise<{ code?: string }> {
  const { data, error } = await supabase.functions.invoke('send-otp', {
    body: { phone },
  });
  if (error) throw error;
  return data ?? {};
}

/**
 * Верифицирует OTP через Edge Function (проверка происходит на сервере).
 * Возвращает true если код верный и не истёк, иначе false.
 */
export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  const { data, error } = await supabase.functions.invoke('verify-otp', {
    body: { phone, code },
  });
  if (error) throw error;
  return data?.verified === true;
}

/**
 * Выход из аккаунта
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Создание или обновление профиля пользователя (upsert).
 * При первичной настройке фиксирует согласие с политикой конфиденциальности.
 */
export async function upsertUserProfile(
  userId: string,
  data: { first_name: string; phone: string; terms_accepted_at?: string; terms_version?: string }
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...data });
  if (error) throw error;
}

/**
 * Авторизация/регистрация пользователя по номеру телефона
 */
export async function authenticateWithPhone(phone: string): Promise<void> {
  const email = phoneToEmail(phone);
  const password = generatePasswordFromPhone(phone);

  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

  if (signInError) {
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { phone } }
    });

    if (signUpError) {
      if (signUpError.message?.includes('already registered') || signUpError.message?.includes('already been registered')) {
        const { error: retryError } = await supabase.auth.signInWithPassword({ email, password });
        if (retryError) throw retryError;
      } else {
        throw signUpError;
      }
    }
  }
}
