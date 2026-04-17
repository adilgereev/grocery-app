import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToastStore } from '@/store/toastStore';
import { useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { fetchUserProfile, updateUserProfile } from '@/lib/api/authApi';
import { logger } from '@/lib/utils/logger';
import { profileSchema, ProfileFormData } from '@/lib/utils/schemas';

export function useProfileForm() {
  const router = useRouter();
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [phone, setPhone] = useState('');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: '',
    }
  });

  const fetchProfile = useCallback(async () => {
    try {
      if (!session?.user?.id) return;
      setLoading(true);
      const data = await fetchUserProfile(session.user.id);

      if (data) {
        reset({
          first_name: data.first_name || '',
        });
        setPhone(data.phone || '');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка загрузки профиля';
      logger.error('Ошибка в fetchProfile:', error);
      useToastStore.getState().showToast('error', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [session, reset]);

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [session, fetchProfile]);

  const onSave = async (formData: ProfileFormData) => {
    if (!session?.user?.id) return;
    try {
      setSaving(true);
      await updateUserProfile(session.user.id, {
        first_name: formData.first_name,
      });

      useToastStore.getState().showToast('success', 'Персональные данные сохранены!');
      router.back();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      useToastStore.getState().showToast('error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return {
    control,
    errors,
    handleSubmit,
    loading,
    saving,
    phone,
    onSave
  };
}
