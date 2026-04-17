import { useLogin } from '@/features/auth/useLogin';
import { LoginFormPhone } from '@/features/auth/LoginFormPhone';
import { LoginFormOtp } from '@/features/auth/LoginFormOtp';

/**
 * Страница входа в админ-панель.
 * Декомпозирована: логика в useLogin, формы в отдельных компонентах.
 */
export function LoginPage() {
  const {
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
  } = useLogin();

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
          <LoginFormPhone
            phone={phone}
            onPhoneChange={setPhone}
            onSendOtp={handleSendOtp}
            loading={loading}
          />
        ) : (
          <LoginFormOtp
            phone={phone}
            otp={otp}
            otpRefs={otpRefs}
            onOtpChange={handleOtpChange}
            onOtpKeyDown={handleOtpKeyDown}
            onVerifyOtp={handleVerifyOtp}
            onSendOtp={handleSendOtp}
            onBack={() => { setStep('phone'); setOtp(['', '', '', '']); }}
            loading={loading}
            countdown={countdown}
          />
        )}
      </div>
    </div>
  );
}
