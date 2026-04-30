import { AdminOrderAssignment, AdminOrderWithDetails, assignStaff, completePickerAssembly, completeCourierDelivery, fetchStaffByType, takeOrderCourier, takeOrderPicker, unassignStaff } from '@/lib/api/adminApi';
import { useAuth } from '@/providers/AuthProvider';
import { StaffMember } from '@/types';
import { useCallback } from 'react';
import { Alert } from 'react-native';

interface Params {
  orders: AdminOrderWithDetails[];
  setOrders: React.Dispatch<React.SetStateAction<AdminOrderWithDetails[]>>;
  fetchOrders: () => Promise<void>;
}

export function useAdminStaffAssign({ orders, setOrders, fetchOrders }: Params) {
  const { profile } = useAuth();

  const applyAssignment = useCallback((orderId: string, staffType: 'picker' | 'courier', assignment: AdminOrderAssignment) => {
    setOrders((prev) => prev.map((o) => {
      if (o.id !== orderId) return o;
      const rest = (o.assignments ?? []).filter((a) => a.staff_type !== staffType);
      return { ...o, assignments: [...rest, assignment] };
    }));
  }, [setOrders]);

  const removeAssignment = useCallback((orderId: string, staffType: 'picker' | 'courier') => {
    setOrders((prev) => prev.map((o) => {
      if (o.id !== orderId) return o;
      return { ...o, assignments: (o.assignments ?? []).filter((a) => a.staff_type !== staffType) };
    }));
  }, [setOrders]);

  const handleConfirmAssign = useCallback(async (orderId: string, staffType: 'picker' | 'courier', member: StaffMember) => {
    applyAssignment(orderId, staffType, {
      staff_type: staffType,
      staff_id: member.id,
      status: 'active',
      staff: { first_name: member.first_name, phone: member.phone },
    });
    try {
      await assignStaff(orderId, staffType, member.id);
    } catch (error: unknown) {
      fetchOrders();
      Alert.alert('Ошибка', error instanceof Error ? error.message : 'Неизвестная ошибка');
    }
  }, [applyAssignment, fetchOrders]);

  const handleUnassign = useCallback(async (orderId: string, staffType: 'picker' | 'courier') => {
    removeAssignment(orderId, staffType);
    try {
      await unassignStaff(orderId, staffType);
    } catch (error: unknown) {
      fetchOrders();
      Alert.alert('Ошибка', error instanceof Error ? error.message : 'Неизвестная ошибка');
    }
  }, [removeAssignment, fetchOrders]);

  const showAssignOptions = useCallback(async (orderId: string, staffType: 'picker' | 'courier') => {
    try {
      const staff = await fetchStaffByType(staffType);
      if (staff.length === 0) {
        Alert.alert('Нет сотрудников', `Нет доступных ${staffType === 'picker' ? 'сборщиков' : 'курьеров'}`);
        return;
      }
      const currentId = orders.find((o) => o.id === orderId)
        ?.assignments?.find((a) => a.staff_type === staffType && a.status === 'active')?.staff_id;
      const buttons: Parameters<typeof Alert.alert>[2] = staff.map((member) => ({
        text: `${member.first_name || member.phone}${currentId === member.id ? ' ✓' : ''}`,
        onPress: () => handleConfirmAssign(orderId, staffType, member),
      }));
      if (currentId) {
        buttons.push({ text: 'Снять назначение', style: 'destructive', onPress: () => handleUnassign(orderId, staffType) });
      }
      buttons.push({ text: 'Назад', style: 'cancel' });
      Alert.alert(staffType === 'picker' ? 'Назначить сборщика' : 'Назначить курьера', 'Выберите сотрудника', buttons);
    } catch (error: unknown) {
      Alert.alert('Ошибка', error instanceof Error ? error.message : 'Неизвестная ошибка');
    }
  }, [orders, handleConfirmAssign, handleUnassign]);

  const handleSelfAssign = useCallback(async (orderId: string, staffType: 'picker' | 'courier') => {
    if (!profile) return;
    applyAssignment(orderId, staffType, {
      staff_type: staffType,
      staff_id: profile.id,
      status: 'active',
      staff: { first_name: profile.first_name, phone: profile.phone },
    });
    try {
      await assignStaff(orderId, staffType, profile.id);
    } catch {
      fetchOrders();
      Alert.alert('Ошибка', 'Не удалось взять заказ');
    }
  }, [profile, applyAssignment, fetchOrders]);

  const handlePickerTakeOrder = useCallback(async (orderId: string) => {
    if (!profile?.id) return;
    applyAssignment(orderId, 'picker', {
      staff_type: 'picker', staff_id: profile.id, status: 'active',
      staff: { first_name: profile.first_name, phone: profile.phone },
    });
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: 'processing' } : o));
    try {
      await takeOrderPicker(orderId, profile.id);
    } catch (e: unknown) {
      fetchOrders();
      Alert.alert('Ошибка', e instanceof Error ? e.message : 'Не удалось взять заказ');
    }
  }, [profile, applyAssignment, setOrders, fetchOrders]);

  const handleCompleteAssembly = useCallback(async (orderId: string) => {
    if (!profile?.id) return;
    setOrders((prev) => prev.map((o) => {
      if (o.id !== orderId) return o;
      return {
        ...o, status: 'assembled',
        assignments: (o.assignments ?? []).map((a) =>
          a.staff_type === 'picker' && a.staff_id === profile.id
            ? { ...a, status: 'completed' as const } : a,
        ),
      };
    }));
    try {
      await completePickerAssembly(orderId, profile.id);
    } catch (e: unknown) {
      fetchOrders();
      Alert.alert('Ошибка', e instanceof Error ? e.message : 'Не удалось завершить сборку');
    }
  }, [profile, setOrders, fetchOrders]);

  const handleCourierStartDelivery = useCallback(async (orderId: string) => {
    if (!profile?.id) return;
    applyAssignment(orderId, 'courier', {
      staff_type: 'courier', staff_id: profile.id, status: 'active',
      staff: { first_name: profile.first_name, phone: profile.phone },
    });
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: 'shipped' } : o));
    try {
      await takeOrderCourier(orderId, profile.id);
    } catch (e: unknown) {
      fetchOrders();
      Alert.alert('Ошибка', e instanceof Error ? e.message : 'Не удалось взять заказ');
    }
  }, [profile, applyAssignment, setOrders, fetchOrders]);

  const handleCompleteDelivery = useCallback(async (orderId: string) => {
    if (!profile?.id) return;
    setOrders((prev) => prev.map((o) => {
      if (o.id !== orderId) return o;
      return {
        ...o,
        status: 'delivered',
        assignments: (o.assignments ?? []).map((a) =>
          a.staff_type === 'courier' && a.staff_id === profile.id
            ? { ...a, status: 'completed' as const }
            : a,
        ),
      };
    }));
    try {
      await completeCourierDelivery(orderId, profile.id);
    } catch (e: unknown) {
      fetchOrders();
      Alert.alert('Ошибка', e instanceof Error ? e.message : 'Не удалось завершить доставку');
    }
  }, [profile, setOrders, fetchOrders]);

  return { showAssignOptions, handleSelfAssign, handleCompleteDelivery,
           handlePickerTakeOrder, handleCompleteAssembly, handleCourierStartDelivery };
}
