import {
  AdminOrderItem,
  AdminOrderWithDetails,
  ReplacementSuggestion,
  deleteOrderItem,
  replaceOrderItem,
} from "@/lib/api/adminApi";
import { useAuth } from "@/providers/AuthProvider";
import { useCallback } from "react";
import { Alert } from "react-native";

interface ReplaceTarget {
  item: AdminOrderItem;
  order: AdminOrderWithDetails;
}

interface Params {
  setOrders: React.Dispatch<React.SetStateAction<AdminOrderWithDetails[]>>;
  replaceTarget: ReplaceTarget | null;
  setReplaceTarget: React.Dispatch<React.SetStateAction<ReplaceTarget | null>>;
}

export type { ReplaceTarget };

export function useAdminItemActions({ setOrders, replaceTarget, setReplaceTarget }: Params) {
  const { session } = useAuth();

  const updateOrderInState = useCallback(
    (orderId: string, updatedItems: AdminOrderItem[], newTotal: number) => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, items: updatedItems, total_amount: newTotal } : o,
        ),
      );
    },
    [setOrders],
  );

  const showItemOptions = useCallback(
    (item: AdminOrderItem, order: AdminOrderWithDetails) => {
      const productName = item.product?.name ?? "товар";
      Alert.alert(`«${productName}»`, "Что сделать с этим товаром?", [
        {
          text: "Заменить на аналог",
          onPress: () => setReplaceTarget({ item, order }),
        },
        {
          text: "Удалить из заказа",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Удалить товар?",
              `«${productName}» будет удалён из заказа, сумма пересчитается.`,
              [
                { text: "Отмена", style: "cancel" },
                {
                  text: "Удалить",
                  style: "destructive",
                  onPress: async () => {
                    if (!session?.user.id) return;
                    const newTotal =
                      order.total_amount - item.quantity * item.price_at_time;
                    try {
                      await deleteOrderItem({
                        itemId: item.id,
                        orderId: order.id,
                        productName,
                        newTotal,
                        currentStatus: order.status,
                        adminId: session.user.id,
                      });
                      const updatedItems = (order.items ?? []).filter((i) => i.id !== item.id);
                      updateOrderInState(order.id, updatedItems, newTotal);
                    } catch {
                      Alert.alert("Ошибка", "Не удалось удалить товар");
                    }
                  },
                },
              ],
            );
          },
        },
        { text: "Назад", style: "cancel" },
      ]);
    },
    [session, setReplaceTarget, updateOrderInState],
  );

  const handleConfirmReplace = useCallback(
    async (replacement: ReplacementSuggestion) => {
      if (!replaceTarget || !session?.user.id) return;
      const { item, order } = replaceTarget;
      const newTotal =
        order.total_amount -
        item.quantity * item.price_at_time +
        item.quantity * replacement.price;
      try {
        await replaceOrderItem({
          itemId: item.id,
          orderId: order.id,
          newProductId: replacement.id,
          newPrice: replacement.price,
          newTotal,
          originalProductName: item.product?.name ?? "—",
          newProductName: replacement.name,
          currentStatus: order.status,
          adminId: session.user.id,
        });
        const updatedItems = (order.items ?? []).map((i) =>
          i.id === item.id
            ? {
                ...i,
                price_at_time: replacement.price,
                product: {
                  id: replacement.id,
                  name: replacement.name,
                  unit: replacement.unit,
                  image_url: replacement.image_url,
                  category_id: i.product?.category_id ?? null,
                  price: replacement.price,
                },
              }
            : i,
        );
        updateOrderInState(order.id, updatedItems, newTotal);
        setReplaceTarget(null);
      } catch {
        Alert.alert("Ошибка", "Не удалось заменить товар");
      }
    },
    [replaceTarget, session, updateOrderInState, setReplaceTarget],
  );

  const dismissReplaceTarget = useCallback(() => setReplaceTarget(null), [setReplaceTarget]);

  return { showItemOptions, handleConfirmReplace, dismissReplaceTarget };
}
