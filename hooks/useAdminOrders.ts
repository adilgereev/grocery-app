import {
  AdminOrderWithDetails,
  fetchAllOrdersWithDetails,
  updateOrderStatus,
} from "@/lib/api/adminApi";
import { supabase } from "@/lib/services/supabase";
import { OrderStatus } from "@/constants/orderStatuses";
import { useCallback, useEffect, useState } from "react";
import { Alert, Linking } from "react-native";

interface UseAdminOrdersReturn {
  orders: AdminOrderWithDetails[];
  loading: boolean;
  expandedOrders: string[];
  fetchOrders: () => Promise<void>;
  toggleExpand: (id: string) => void;
  handleUpdateStatus: (
    orderId: string,
    newStatus: OrderStatus,
  ) => Promise<void>;
  showStatusOptions: (orderId: string, currentStatus: string) => void;
  callCustomer: (phone: string | null) => void;
}

export function useAdminOrders(): UseAdminOrdersReturn {
  const [orders, setOrders] = useState<AdminOrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedOrders((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id],
    );
  }, []);

  const handleUpdateStatus = useCallback(
    async (orderId: string, newStatus: OrderStatus) => {
      try {
        await updateOrderStatus(orderId, newStatus);
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
        );
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Неизвестная ошибка";
        Alert.alert("Ошибка", errorMessage);
      }
    },
    [],
  );

  const showStatusOptions = useCallback(
    (orderId: string, _currentStatus: string) => {
      Alert.alert("Изменить статус", "Выберите новый статус для заказа", [
        {
          text: "Сборка",
          onPress: () => handleUpdateStatus(orderId, "processing"),
        },
        {
          text: "В пути",
          onPress: () => handleUpdateStatus(orderId, "shipped"),
        },
        {
          text: "Доставлен",
          onPress: () => handleUpdateStatus(orderId, "delivered"),
        },
        {
          text: "Отмена",
          onPress: () => handleUpdateStatus(orderId, "cancelled"),
          style: "destructive",
        },
        { text: "Назад", style: "cancel" },
      ]);
    },
    [handleUpdateStatus],
  );

  const callCustomer = useCallback((phone: string | null) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert("Ошибка", "У клиента не указан номер телефона");
    }
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchAllOrdersWithDetails();
      setOrders(data);
    } catch {
      // Ошибка загрузки заказов
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel("admin_orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          fetchOrders();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    orders,
    loading,
    expandedOrders,
    fetchOrders,
    toggleExpand,
    handleUpdateStatus,
    showStatusOptions,
    callCustomer,
  };
}
