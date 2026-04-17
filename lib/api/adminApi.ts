/**
 * Сервисный слой для административных операций.
 * Изолирует прямые Supabase-вызовы от экранов admin-панели.
 * Файл декомпозирован на модули: categories, products, orders.
 */

export * from './admin/categoriesApi';
export * from './admin/productsApi';
export * from './admin/ordersApi';

// Реэкспорт типов
export type { AdminOrderWithDetails } from './admin/ordersApi';
