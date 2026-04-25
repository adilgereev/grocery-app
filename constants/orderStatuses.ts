import { Colors } from "@/constants/theme";

export const STATUSES = {
  pending:    { label: "Новый",     color: Colors.light.warning, bgColor: Colors.light.warningLight },
  processing: { label: "Сборка",    color: Colors.light.info,    bgColor: Colors.light.infoLight },
  assembled:  { label: "Собран",    color: Colors.light.primary, bgColor: Colors.light.primaryLight },
  shipped:    { label: "В пути",    color: Colors.light.info,    bgColor: Colors.light.infoLight },
  delivered:  { label: "Доставлен", color: Colors.light.success, bgColor: Colors.light.successLight },
  cancelled:  { label: "Отменен",   color: Colors.light.error,   bgColor: Colors.light.errorLight },
};

export type OrderStatus = keyof typeof STATUSES;
