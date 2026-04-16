import { Colors } from "@/constants/theme";

export const STATUSES = {
  pending: { label: "Новый", color: Colors.light.warning },
  processing: { label: "Сборка", color: Colors.light.info },
  shipped: { label: "В пути", color: Colors.light.info },
  delivered: { label: "Доставлен", color: Colors.light.success },
  cancelled: { label: "Отменен", color: Colors.light.error },
};

export type OrderStatus = keyof typeof STATUSES;
