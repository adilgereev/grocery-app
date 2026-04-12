import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { authPhoneSchema, otpSchema } from '@/lib/schemas';
import { normalizePhone, formatPhoneDisplay, generatePasswordFromPhone, phoneToEmail } from '@/lib/authUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

type Step = 'phone' | 'otp';

export function LoginPage() {
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

  // Редирект если уже авторизован
  useEffect(() => {
    if (session && isAdmin) {
      navigate('/products', { replace: true });
    }
  }, [session, isAdmin, navigate]);

  // Обратный отсчёт для повторной отправки
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  async function handleSendOtp() {
    const normalized = normalizePhone(phone);
    
    const phoneValidation = authPhoneSchema.safeParse(normalized);
    if (!phoneValidation.success) {
      const errorMsg = phoneValidation.error.issues[0]?.message || 'Введите корректный номер телефона';
      toast.error(errorMsg);
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
      const errorMsg = otpValidation.error.issues[0]?.message || 'Введен некорректный код';
      toast.error(errorMsg);
      return;
    }

    setLoading(true);
    try {
      const normalized = normalizePhone(phone);

      // Верификация OTP через Edge Function
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

      // Авторизация через Supabase Auth
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: phoneToEmail(normalized),
        password: generatePasswordFromPhone(normalized),
      });

      if (signInError) throw signInError;

      // AuthContext подхватит сессию автоматически, редирект через useEffect
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

    // Автофокус на следующем поле
    if (value && index < 3) {
      otpRefs[index + 1].current?.focus();
    }

    // Автоверификация при заполнении всех 4 цифр
    if (newOtp.every(d => d !== '') && newOtp.join('').length === 4) {
      setTimeout(() => {
        const code = newOtp.join('');
        if (code.length === 4) handleVerifyOtpWithCode(code);
      }, 50);
    }
  }

  async function handleVerifyOtpWithCode(code: string) {
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
    } finally {
      setLoading(false);
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-sm">
        {/* Логотип */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-2xl font-bold">
            D
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-tight">DELIVA Admin</h1>
            <p className="text-sm text-muted-foreground">Панель управления</p>
          </div>
        </div>

        {step === 'phone' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Номер телефона</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+7 (900) 000-00-00"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                autoFocus
              />
            </div>
            <Button
              className="w-full"
              onClick={handleSendOtp}
              disabled={loading}
            >
              {loading ? 'Отправка...' : 'Получить код'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Код из SMS</Label>
              <p className="text-sm text-muted-foreground">
                Отправлен на {formatPhoneDisplay(phone)}
              </p>
              <div className="flex gap-2">
                {otp.map((digit, i) => (
                  <Input
                    key={i}
                    ref={otpRefs[i]}
                    className="h-14 text-center text-xl font-bold"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    inputMode="numeric"
                    disabled={loading}
                  />
                ))}
              </div>
            </div>

            <Button
              className="w-full"
              onClick={handleVerifyOtp}
              disabled={loading || otp.some(d => d === '')}
            >
              {loading ? 'Проверка...' : 'Войти'}
            </Button>

            <div className="flex items-center justify-between text-sm">
              <button
                className="text-muted-foreground hover:text-foreground"
                onClick={() => { setStep('phone'); setOtp(['', '', '', '']); }}
              >
                ← Изменить номер
              </button>
              {countdown > 0 ? (
                <span className="text-muted-foreground">Повтор через {countdown}с</span>
              ) : (
                <button className="text-primary" onClick={handleSendOtp} disabled={loading}>
                  Отправить снова
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
