import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { authPhoneSchema, otpSchema } from '@/lib/schemas';
import { normalizePhone, formatPhoneDisplay, generatePasswordFromPhone, phoneToEmail } from '@/lib/authUtils';
import { useAuth } from '@/contexts/AuthContext';

export type Step = 'phone' | 'otp';

/**
 * Хук логики авторизации для декомпозиции LoginPage.
 */
export function useLogin() {
  const navigate = useNavigate();
  const { session, isAdmin } = useAuth();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    if (session && isAdmin) {
      navigate('/products', { replace: true });
    }
  }, [session, isAdmin, navigate]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  async function handleSendOtp() {
    const normalized = normalizePhone(phone);
    const phoneValidation = authPhoneSchema.safeParse(normalized);
    
    if (!phoneValidation.success) {
      toast.error(phoneValidation.error.issues[0]?.message || 'Введите корректный номер телефона');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phone: normalized },
      });

      if (error) throw error;

      if (import.meta.env.DEV && data?.code) {
        toast.info(`[DEV] Ваш код: ${data.code}`);
      } else {
        toast.success(`SMS отправлено на ${formatPhoneDisplay(phone)}`);
      }

      setStep('otp');
      setCountdown(60);
      setOtp(['', '', '', '']);
      setTimeout(() => otpRefs[0].current?.focus(), 100);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ошибка отправки SMS');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    const code = otp.join('');
    const otpValidation = otpSchema.safeParse(code);
    
    if (!otpValidation.success) {
      toast.error(otpValidation.error.issues[0]?.message || 'Введен некорректный код');
      return;
    }

    setLoading(true);
    try {
      const normalized = normalizePhone(phone);
      const { data, error: verifyError } = await supabase.functions.invoke('verify-otp', {
        body: { phone: normalized, code },
      });

      if (verifyError) throw verifyError;
      if (!data?.verified) {
        toast.error('Неверный или истёкший код');
        setOtp(['', '', '', '']);
        otpRefs[0].current?.focus();
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: phoneToEmail(normalized),
        password: generatePasswordFromPhone(normalized),
      });

      if (signInError) throw signInError;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ошибка авторизации');
      setLoading(false);
    }
  }

  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 3) {
      otpRefs[index + 1].current?.focus();
    }

    if (newOtp.every(d => d !== '') && newOtp.join('').length === 4) {
      setTimeout(() => {
        const code = newOtp.join('');
        if (code.length === 4) handleVerifyOtpWithCode(code);
      }, 50);
    }
  }

  async function handleVerifyOtpWithCode(code: string) {
    const otpValidation = otpSchema.safeParse(code);
    if (!otpValidation.success) return;

    setLoading(true);
    try {
      const normalized = normalizePhone(phone);
      const { data, error: verifyError } = await supabase.functions.invoke('verify-otp', {
        body: { phone: normalized, code },
      });

      if (verifyError) throw verifyError;
      if (!data?.verified) {
        toast.error('Неверный или истёкший код');
        setOtp(['', '', '', '']);
        otpRefs[0].current?.focus();
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: phoneToEmail(normalized),
        password: generatePasswordFromPhone(normalized),
      });

      if (signInError) throw signInError;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  }

  return {
    step, setStep,
    phone, setPhone,
    otp, setOtp,
    loading,
    countdown,
    otpRefs,
    handleSendOtp,
    handleVerifyOtp,
    handleOtpChange,
    handleOtpKeyDown,
  };
}
