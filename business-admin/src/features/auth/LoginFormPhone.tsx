import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface LoginFormPhoneProps {
  phone: string;
  onPhoneChange: (value: string) => void;
  onSendOtp: () => void;
  loading: boolean;
}

/**
 * Шаг 1: Ввод номера телефона.
 */
export function LoginFormPhone({ phone, onPhoneChange, onSendOtp, loading }: LoginFormPhoneProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phone">Номер телефона</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+7 (900) 000-00-00"
          value={phone}
          onChange={e => onPhoneChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onSendOtp()}
          autoFocus
        />
      </div>
      <Button
        className="w-full"
        onClick={onSendOtp}
        disabled={loading}
        data-testid="send-otp-btn"
      >
        {loading ? 'Отправка...' : 'Получить код'}
      </Button>
    </div>
  );
}
