import { updateOrderStatus, AdminOrderWithDetails } from "@/lib/api/adminApi";
import { OrderStatus } from "@/constants/orderStatuses";
import { type Dispatch, type SetStateAction, useCallback } from "react";
import { Alert } from "react-native";

export function useAdminOrderStatus(
  setOrders: Dispatch<SetStateAction<AdminOrderWithDetails[]>>,
) {
  const handleUpdateStatus = useCallback(
    async (orderId: string, newStatus: OrderStatus) => {
      try {
        await updateOrderStatus(orderId, newStatus);
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
        );
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Неизвестная ошибка";
        Alert.alert("Ошибка", msg);
      }
    },
    [setOrders],
  );

  return { handleUpdateStatus };
}
