import {
  AdminOrderItem,
  AdminOrderWithDetails,
  ReplacementSuggestion,
  fetchAllOrdersWithDetails,
  fetchStaffHistoryOrders,
} from "@/lib/api/adminApi";
import { supabase } from "@/lib/services/supabase";
import { OrderStatus } from "@/constants/orderStatuses";
import { useAuth } from "@/providers/AuthProvider";
import { useCallback, useEffect, useState } from "react";
import { Alert, Linking } from "react-native";
import { useAdminItemActions, ReplaceTarget } from "./useAdminItemActions";
import { useAdminOrderStatus } from "./useAdminOrderStatus";
import { useAdminStaffAssign } from "./useAdminStaffAssign";

interface UseAdminOrdersReturn {
  orders: AdminOrderWithDetails[];
  historyOrders: AdminOrderWithDetails[];
  activeTab: 'active' | 'history';
  setActiveTab: React.Dispatch<React.SetStateAction<'active' | 'history'>>;
  loading: boolean;
  expandedOrders: string[];
  replaceTarget: ReplaceTarget | null;
  fetchOrders: () => Promise<void>;
  fetchHistory: () => Promise<void>;
  toggleExpand: (id: string) => void;
  showStatusOptions: (orderId: string, currentStatus: string) => void;
  showItemOptions: (item: AdminOrderItem, order: AdminOrderWithDetails) => void;
  handleConfirmReplace: (replacement: ReplacementSuggestion) => Promise<void>;
  dismissReplaceTarget: () => void;
  callCustomer: (phone: string | null) => void;
  showAssignOptions: (orderId: string, staffType: 'picker' | 'courier') => Promise<void>;
  handleSelfAssign: (orderId: string, staffType: 'picker' | 'courier') => Promise<void>;
  handlePickerTakeOrder: (orderId: string) => Promise<void>;
  handleCompleteAssembly: (orderId: string) => Promise<void>;
  handleCourierStartDelivery: (orderId: string) => Promise<void>;
  handleCompleteDelivery: (orderId: string) => Promise<void>;
}

export function useAdminOrders(): UseAdminOrdersReturn {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<AdminOrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  const [replaceTarget, setReplaceTarget] = useState<ReplaceTarget | null>(null);

  const role = profile?.is_admin ? 'admin' : profile?.is_picker ? 'picker' : 'courier';

  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [historyOrders, setHistoryOrders] = useState<AdminOrderWithDetails[]>([]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const statusFilter = ['pending', 'processing', 'assembled', 'shipped'] as const;
      const data = await fetchAllOrdersWithDetails(statusFilter);
      setOrders(data);
    } catch (e: unknown) {
      Alert.alert('Ошибка', e instanceof Error ? e.message : 'Не удалось загрузить заказы');
    }
    setLoading(false);
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      let data: AdminOrderWithDetails[];
      if (role === 'admin') {
        data = await fetchAllOrdersWithDetails(['delivered', 'cancelled']);
      } else {
        const staffType = role === 'picker' ? 'picker' : 'courier';
        data = await fetchStaffHistoryOrders(profile?.id ?? '', staffType);
      }
      setHistoryOrders(data);
    } catch (e: unknown) {
      Alert.alert('Ошибка', e instanceof Error ? e.message : 'Не удалось загрузить историю');
    }
  }, [role, profile?.id]);

  const { showItemOptions, handleConfirmReplace, dismissReplaceTarget } = useAdminItemActions({
    setOrders,
    replaceTarget,
    setReplaceTarget,
  });

  const { handleUpdateStatus } = useAdminOrderStatus(setOrders);
  const { showAssignOptions, handleSelfAssign, handleCompleteDelivery,
          handlePickerTakeOrder, handleCompleteAssembly, handleCourierStartDelivery } =
    useAdminStaffAssign({ orders, setOrders, fetchOrders });

  const toggleExpand = useCallback((id: string) => {
    setExpandedOrders((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id],
    );
  }, []);

  const callCustomer = useCallback((phone: string | null) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert("Ошибка", "У клиента не указан номер телефона");
    }
  }, []);

  const showStatusOptions = useCallback((orderId: string, _currentStatus: string) => {
    const update = (s: OrderStatus) => () => handleUpdateStatus(orderId, s);
    const cancel = { text: "Назад", style: "cancel" as const };
    const destroy = { text: "Отмена", onPress: update("cancelled"), style: "destructive" as const };
    const adminButtons = [
      { text: "Новый",     onPress: update("pending") },
      { text: "Сборка",    onPress: update("processing") },
      { text: "Собран",    onPress: update("assembled") },
      { text: "В пути",    onPress: update("shipped") },
      { text: "Доставлен", onPress: update("delivered") },
      destroy, cancel,
    ];
    Alert.alert("Изменить статус", "Выберите новый статус", adminButtons);
  }, [handleUpdateStatus]);

  useEffect(() => {
    fetchOrders();
    fetchHistory();
    const channel = supabase
      .channel("admin_orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        fetchOrders();
        fetchHistory();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "staff_assignments" }, () => {
        fetchOrders();
        fetchHistory();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchOrders, fetchHistory]);

  return {
    orders, historyOrders, activeTab, setActiveTab,
    loading, expandedOrders, replaceTarget,
    fetchOrders, fetchHistory,
    toggleExpand, showStatusOptions, showItemOptions, handleConfirmReplace,
    dismissReplaceTarget, callCustomer, showAssignOptions, handleSelfAssign,
    handlePickerTakeOrder, handleCompleteAssembly, handleCourierStartDelivery, handleCompleteDelivery,
  };
}
