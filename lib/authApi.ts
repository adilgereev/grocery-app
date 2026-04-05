import { supabase } from './supabase';
import { Profile } from '@/types';
import { Session } from '@supabase/supabase-js';

import { generatePasswordFromPhone, phoneToEmail } from './authUtils';

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
 * Создать новый код подтверждения в базе
 */
export async function createOtpCode(phone: string, code: string): Promise<void> {
  const { error } = await supabase.from('otp_codes').insert({
    phone,
    code,
    expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  });
  if (error) throw error;
}

/**
 * Ищет активный и правильный код
 */
export async function verifyActiveOtp(phone: string, code: string): Promise<string | null> {
  const { data: otpData, error: otpError } = await supabase
    .from('otp_codes')
    .select('id')
    .eq('phone', phone)
    .eq('code', code)
    .eq('used', false)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (otpError || !otpData) return null;
  return otpData.id;
}

/**
 * Помечает код как использованный
 */
export async function markOtpAsUsed(otpId: string): Promise<void> {
  const { error } = await supabase.from('otp_codes').update({ used: true }).eq('id', otpId);
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
