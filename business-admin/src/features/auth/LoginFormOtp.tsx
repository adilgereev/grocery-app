import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatPhoneDisplay } from '@/lib/authUtils';

interface LoginFormOtpProps {
  phone: string;
  otp: string[];
  otpRefs: React.RefObject<HTMLInputElement>[];
  onOtpChange: (index: number, value: string) => void;
  onOtpKeyDown: (index: number, e: React.KeyboardEvent) => void;
  onVerifyOtp: () => void;
  onSendOtp: () => void;
  onBack: () => void;
  loading: boolean;
  countdown: number;
}

/**
 * Шаг 2: Ввод OTP кода.
 */
export function LoginFormOtp({
  phone,
  otp,
  otpRefs,
  onOtpChange,
  onOtpKeyDown,
  onVerifyOtp,
  onSendOtp,
  onBack,
  loading,
  countdown,
}: LoginFormOtpProps) {
  return (
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
              onChange={e => onOtpChange(i, e.target.value)}
              onKeyDown={e => onOtpKeyDown(i, e)}
              inputMode="numeric"
              disabled={loading}
            />
          ))}
        </div>
      </div>

      <Button
        className="w-full"
        onClick={onVerifyOtp}
        disabled={loading || otp.some(d => d === '')}
        data-testid="verify-otp-btn"
      >
        {loading ? 'Проверка...' : 'Войти'}
      </Button>

      <div className="flex items-center justify-between text-sm">
        <button
          className="text-muted-foreground hover:text-foreground"
          onClick={onBack}
          data-testid="change-phone-btn"
        >
          ← Изменить номер
        </button>
        {countdown > 0 ? (
          <span className="text-muted-foreground">Повтор через {countdown}с</span>
        ) : (
          <button className="text-primary" onClick={onSendOtp} disabled={loading} data-testid="resend-otp-btn">
            Отправить снова
          </button>
        )}
      </div>
    </div>
  );
}
