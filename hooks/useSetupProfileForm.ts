import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/providers/AuthProvider';
import { upsertUserProfile } from '@/lib/api/authApi';
import { logger } from '@/lib/utils/logger';
import { profileSchema, ProfileFormData } from '@/lib/utils/schemas';

export function useSetupProfileForm() {
  const { session, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { first_name: '' },
  });

  const onSave = async (formData: ProfileFormData) => {
    if (!session?.user?.id) return;
    try {
      setSaving(true);
      setError(null);
      // Телефон из сессии (обязательное поле NOT NULL в БД)
      const phone = session.user.user_metadata?.phone || session.user.phone || '';

      // Используем upsert — профиль может ещё не существовать в БД
      await upsertUserProfile(session.user.id, {
        first_name: formData.first_name,
        phone,
      });
      // Обновляем профиль в контексте → layout перенаправит в табы
      await refreshProfile();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Произошла ошибка';
      setError(msg);
      logger.error('Ошибка сохранения профиля:', err);
    } finally {
      setSaving(false);
    }
  };

  return { control, errors, handleSubmit, saving, error, onSave };
}
