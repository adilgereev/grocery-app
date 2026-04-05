# 🔍 Код-ревью: Grocery App

> **Дата**: 05.04.2026  
> **Объём**: 112 файлов, ~12 500 строк TypeScript/TSX  
> **Стандарты**: `.agent/rules/` (architecture, code-standards, storage-standards, project-overview)  
> **Исключено из проверки**: UI-токены и Soft Minimalism compliance

---

## 🔴 Критические (P0) — Безопасность и баги

### ~~1. SMS.ru API-ключ захардкожен в исходном коде~~ ✅ FIXED

**Файл**: [sms.ts](file:///d:/Dev/JS%20projects/grocery-app/lib/sms.ts#L2)

**Исправлено**: Ключ перенесён в `.env` как `EXPO_PUBLIC_SMS_RU_API_ID`. В `sendSMS()` добавлена ленивая проверка — приложение не крашнется при импорте, ошибка возвращается в контексте вызова.

---

### ~~2. OTP-код показывается пользователю в алерте (даже в продакшене)~~ ✅ FIXED

**Файл**: [login.tsx](file:///d:/Dev/JS%20projects/grocery-app/app/%28auth%29/login.tsx#L136)

**Исправлено**: В `__DEV__` показывается код для отладки. В продакшене — сообщение «SMS отправлено на {phone}» или текст ошибки SMS. TODO-комментарий удалён.

---

### 3. Генерация пароля из телефона — предсказуемая

**Файл**: [sms.ts](file:///d:/Dev/JS%20projects/grocery-app/lib/sms.ts#L82-L86)

```typescript
export function generatePasswordFromPhone(phone: string): string {
  return `grc_${normalized}_s4lt_2026_pr0d`;
}
```

> [!WARNING]
> Пароль **детерминированный** и формула видна в исходниках. Зная номер телефона, можно сгенерировать пароль и войти в аккаунт без OTP. Соль (`s4lt_2026_pr0d`) тоже в коде.

**Исправление**: Использовать серверную генерацию паролей через Supabase Edge Function, или хотя бы использовать настоящий HMAC с секретом из env.

---

### ~~4. `deleteAddress` не проверяет `user_id`~~ ✅ FIXED

**Файл**: [addressApi.ts](file:///d:/Dev/JS%20projects/grocery-app/lib/addressApi.ts#L54)

**Исправлено**: Сигнатура изменена на `deleteAddress(userId, id)`. Добавлен `.eq('user_id', userId)`. Вызов в `addressStore.removeAddress` обновлён с получением сессии.

---

### 5. `markAddressAsSelected` — гонка между двумя запросами

**Файл**: [addressApi.ts](file:///d:/Dev/JS%20projects/grocery-app/lib/addressApi.ts#L66-L82)

```typescript
// 1. Снимаем флажок у всех
await supabase.from('addresses').update({ is_selected: false }).eq('user_id', userId);
// 2. Ставим на выбранный
await supabase.from('addresses').update({ is_selected: true }).eq('id', id);
```

> [!WARNING]
> Между запросами 1 и 2 другой вызов может создать состояние **без выбранного адреса**. Нет транзакции.

**Исправление**: Объединить в одну RPC-функцию на стороне Supabase (PostgreSQL).

---

### 6. `addressStore` обращается к `supabase` напрямую

**Файл**: [addressStore.ts](file:///d:/Dev/JS%20projects/grocery-app/store/addressStore.ts#L75-L76)

```typescript
const { data: { session } } = await supabase.auth.getSession();
```

> [!IMPORTANT]
> Стор вызывает `supabase.auth.getSession()` напрямую в 5 местах вместо использования `AuthProvider` / `useAuth`. Нарушает `architecture.md` (п. 2: backend-логика через сервисный слой). Аналогичная проблема в [favoriteStore.ts](file:///d:/Dev/JS%20projects/grocery-app/store/favoriteStore.ts).

---

### ~~7. `favoriteStore.toggleFavorite` — оптимистичное обновление без отката~~ ✅ FIXED

**Файл**: [favoriteStore.ts](file:///d:/Dev/JS%20projects/grocery-app/store/favoriteStore.ts#L38)

**Исправлено**: Перед оптимистичным апдейтом сохраняется `previousIds = [...favoriteIds]`. В `catch` — `set({ favoriteIds: previousIds })` откатывает UI к предыдущему состоянию.

---

## 🟡 Серьёзные (P1) — Типизация и архитектура

### 8. `any` в продакшен-коде (нарушение Strict Typing)

Правило: *«Никогда не использовать `any`»* (GEMINI.md, code-standards.md).

| Файл | Строка | Контекст |
|---|---|---|
| [orderApi.ts](file:///d:/Dev/JS%20projects/grocery-app/lib/orderApi.ts#L6) | 6 | `Promise<any>` в `createOrder` |
| [orderApi.ts](file:///d:/Dev/JS%20projects/grocery-app/lib/orderApi.ts#L37) | 37 | `Promise<any[]>` в `fetchOrders` |
| [orderApi.ts](file:///d:/Dev/JS%20projects/grocery-app/lib/orderApi.ts#L51) | 51 | `Promise<any>` в `fetchOrderDetails` |
| [authApi.ts](file:///d:/Dev/JS%20projects/grocery-app/lib/authApi.ts#L20) | 20 | `updates: any` в `updateUserProfile` |
| [logger.ts](file:///d:/Dev/JS%20projects/grocery-app/lib/logger.ts#L7) | 7-24 | `...args: any[]` ×4 |
| [index.tsx (home)](file:///d:/Dev/JS%20projects/grocery-app/app/%28tabs%29/%28index%29/index.tsx#L45) | 45 | `useState<any[]>([])` для `popularProducts` |
| [index.tsx (home)](file:///d:/Dev/JS%20projects/grocery-app/app/%28tabs%29/%28index%29/index.tsx#L77) | 77 | `catch (error: any)` |
| [cart/index.tsx](file:///d:/Dev/JS%20projects/grocery-app/app/%28tabs%29/%28cart%29/index.tsx#L49) | 49 | `(addr: any)` в `formatAddress` |
| [admin/\*.web.tsx](file:///d:/Dev/JS%20projects/grocery-app/app/%28admin%29) | разные | `catch (error: any)` ×5 |

**Итого: ~15 случаев `any` в продакшен-коде.**

---

### 9. `authApi.fetchUserProfile` — нет return type

**Файл**: [authApi.ts](file:///d:/Dev/JS%20projects/grocery-app/lib/authApi.ts#L6)

```typescript
export async function fetchUserProfile(userId: string) { // ← нет return type
```

Правило: *«Всегда указывать типы возвращаемых значений для функций и хуков»* (GEMINI.md).

Затронуты также: `updateUserProfile`, `getSession` в том же файле.

---

### 10. Прямые вызовы Supabase из экранов (минуя сервисный слой)

Правило: `architecture.md` — *«Хранилище как Источник Правды»*, логика через lib/.

| Экран | Что делает напрямую |
|---|---|
| [orders.tsx](file:///d:/Dev/JS%20projects/grocery-app/app/orders.tsx#L30-L34) | `supabase.from('orders').select(...)` |
| [order/[id].tsx](file:///d:/Dev/JS%20projects/grocery-app/app/order/%5Bid%5D.tsx) | `supabase.from('orders')`, `supabase.from('order_items')` |
| [favorites.tsx](file:///d:/Dev/JS%20projects/grocery-app/app/favorites.tsx#L27-L49) | `supabase.from('products').select(...)` ×2 |
| [edit-profile.tsx](file:///d:/Dev/JS%20projects/grocery-app/app/edit-profile.tsx#L42-L80) | `supabase.from('profiles')` ×2 |
| [(tabs)/(profile)/index.tsx](file:///d:/Dev/JS%20projects/grocery-app/app/%28tabs%29/%28profile%29/index.tsx#L30) | `supabase.from('profiles')` |
| [(admin)/\*](file:///d:/Dev/JS%20projects/grocery-app/app/%28admin%29) | **Все** экраны admin обращаются напрямую |

> [!IMPORTANT]
> Уже есть `lib/orderApi.ts`, `lib/authApi.ts`, но они **не используются** в соответствующих экранах. API-слой создан, но экраны его игнорируют.

---

### 11. `console.error` вместо `logger.error`

**Файл**: [edit-profile.tsx](file:///d:/Dev/JS%20projects/grocery-app/app/edit-profile.tsx#L58)

```typescript
console.error('Ошибка в fetchProfile:', error);
```

Правило: `code-standards.md` — *«Чистота: всегда удалять логи»*. Есть `logger` — нужно использовать его.

---

### 12. `types/index.ts` vs `types/supabase.ts` — рассинхрон

**Файл**: [types/index.ts](file:///d:/Dev/JS%20projects/grocery-app/types/index.ts)

- `Category` в `types/index.ts` содержит поле `image_transformations` (строка 8), которого **нет** в `types/supabase.ts`
- `Profile` в `types/index.ts` **не содержит** `avatar_url`, но в `types/supabase.ts` оно есть

> [!IMPORTANT]
> Ручные типы в `types/index.ts` разошлись с автогенерированными Supabase-типами. Согласно `architecture.md`, после изменения схемы нужно обновлять типы через `npm run supabase:types`.

---

### 13. Дублирование логики в `lib/address.ts` и `lib/addressUtils.ts`

Оба файла содержат функцию очистки адреса от «г. Буйнакск» и «Республика Дагестан»:

| Файл | Функция |
|---|---|
| [address.ts](file:///d:/Dev/JS%20projects/grocery-app/lib/address.ts#L6) | `cleanAddress()` |
| [addressUtils.ts](file:///d:/Dev/JS%20projects/grocery-app/lib/addressUtils.ts#L19) | `cleanAddressStreet()` |
| [addressFormatter.ts](file:///d:/Dev/JS%20projects/grocery-app/utils/addressFormatter.ts#L6) | `cleanStreetName()` (private) |

**3 функции делают почти одно и то же.** Нарушение DRY.

---

### 14. Компоненты без `testID` на интерактивных элементах

Правило: `code-standards.md` — *«Сразу добавлять testID новым компонентам»*.

Компоненты **с** testID (✅): `AddressSearchInput`, `CartItem`, `CartSummary`, `ProductCard`, `SubcategoryCard`, `OrderCard`, `EmptyCart`, `FloatingCheckoutButton`, `CategoryItem`, `CategoryFormModal`.

Компоненты/экраны **без** testID (❌) на ключевых элементах:
- `login.tsx` — кнопки «Продолжить», OTP-поля
- `edit-profile.tsx` — кнопка «Сохранить», инпуты
- `addresses.tsx` — карточки адресов, кнопка «Добавить»
- `manage-address.tsx` — кнопки действий  
- [ScreenHeader.tsx](file:///d:/Dev/JS%20projects/grocery-app/components/ScreenHeader.tsx) — кнопка «Назад»
- Навигационные элементы в [_layout.tsx](file:///d:/Dev/JS%20projects/grocery-app/app/%28tabs%29/_layout.tsx)

---

### 15. `appStore.ts` — мёртвый импорт

**Файл**: [appStore.ts](file:///d:/Dev/JS%20projects/grocery-app/store/appStore.ts#L2)

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
```

> [!NOTE]
> `AsyncStorage` импортирован, но не используется. Правило Boy Scout Rule — удалить.

---

### 16. `useCheckout` — неиспользуемые импорты

**Файл**: [useCheckout.ts](file:///d:/Dev/JS%20projects/grocery-app/hooks/useCheckout.ts#L4)

```typescript
import { fetchAddresses, createAddress, updateAddress, deleteAddress, markAddressAsSelected } from '@/lib/addressApi';
```

Из 5 импортированных функций **ни одна не используется** в хуке. Это мёртвый код.

---

### 17. `login.tsx` — файл на 447 строк

Правило: *«Если файл или компонент превышает 200 строк, предлагать его декомпозицию»* (GEMINI.md).

**447 строк** — более чем в 2 раза превышает лимит. Стоит вынести:
- Phone input + маску в отдельный компонент
- OTP input + логику автоперехода в отдельный компонент
- Стили в отдельный файл

---

## 🟢 Незначительные (P2) — Код-стиль и мелочи

### 18. Комментарии на английском

Правило: *«Писать все комментарии к коду исключительно на русском языке»* (code-standards.md).

| Файл | Строка | Комментарий |
|---|---|---|
| [theme.ts](file:///d:/Dev/JS%20projects/grocery-app/constants/theme.ts#L1-L4) | 1-4 | `Below are the colors that are used...` |
| [storageUtils.ts](file:///d:/Dev/JS%20projects/grocery-app/lib/storageUtils.ts#L92) | 92 | `Error uploading image to R2:` |
| [NotificationService.ts](file:///d:/Dev/JS%20projects/grocery-app/lib/NotificationService.ts) | множ. | Английские комментарии |

---

### 19. Пустой `useEffect` без тела

**Файл**: [index.tsx (home)](file:///d:/Dev/JS%20projects/grocery-app/app/%28tabs%29/%28index%29/index.tsx#L96-L98)

```typescript
useEffect(() => {
  // Начальная загрузка при монтировании (базовая)
}, []);
```

Пустой эффект ничего не делает. Удалить.

---

### 20. `fetchRecommended` в favorites.tsx зависит от `recommended.length`

**Файл**: [favorites.tsx](file:///d:/Dev/JS%20projects/grocery-app/app/favorites.tsx#L26)

```typescript
const fetchRecommended = useCallback(async () => {
  if (recommended.length > 0) return; // ← зависимость от стейта в useCallback
  ...
}, [recommended.length]);
```

Зависимость от `recommended.length` приводит к пересозданию колбэка при каждом обновлении. Лучше использовать ref.

---

### 21. `home/index.tsx` — 414 строк (нужна декомпозиция)

**Файл**: [index.tsx (home)](file:///d:/Dev/JS%20projects/grocery-app/app/%28tabs%29/%28index%29/index.tsx)

Превышает 200-строчный лимит в 2 раза. Секции (баннеры, популярное, категории) уже мемоизированы — осталось вынести их в отдельные компоненты.

---

### 22. `NotificationService.ts` — `token` всегда `undefined`

**Файл**: [NotificationService.ts](file:///d:/Dev/JS%20projects/grocery-app/lib/NotificationService.ts#L17-L44)

```typescript
let token; // ← никогда не присваивается
// ...
return token; // ← всегда undefined
```

Переменная `token` объявлена, но нигде не заполняется после удаления `getExpoPushTokenAsync`. Функция всегда возвращает `undefined`.

---

### 23. `CartSummary` экспортирует тип `PaymentMethod`, но определение не видно

Тип `PaymentMethod` используется в [cart/index.tsx](file:///d:/Dev/JS%20projects/grocery-app/app/%28tabs%29/%28cart%29/index.tsx#L2) и [useCheckout.ts](file:///d:/Dev/JS%20projects/grocery-app/hooks/useCheckout.ts#L12). Лучше перенести в `types/index.ts`.

---

### 24. `AddressSearchInput.tsx` — 230 строк

Файл на 230 строк, незначительно выше лимита. При следующей доработке стоит вынести стили.

---

### 25. Отсутствует обработка ошибки `Haptics` на Web

**Файл**: [manage-address.tsx](file:///d:/Dev/JS%20projects/grocery-app/app/manage-address.tsx#L116)

```typescript
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
```

На Web `expo-haptics` может выбросить ошибку. Нет `.web.tsx` версии для `manage-address`.

---

## 📊 Сводка

| Уровень | Всего | Закрыто | Осталось |
|---|---|---|---|
| 🔴 **P0 — Критические** | 7 | ✅ 4 (#1, #2, #4, #7) | ❌ 3 (#3, #5, #6) |
| 🟡 **P1 — Серьёзные** | 10 | — | ❌ 10 |
| 🟢 **P2 — Незначительные** | 8 | — | ❌ 8 |

## ✅ Что сделано хорошо

- **Сервисный слой** (`lib/*Api.ts`) — хорошо спроектирован для products, categories, addresses, favorites
- **Zustand stores** — правильная структура с `persist`, `partialize`, кешированием
- **Валидация** — используется Zod + react-hook-form (schemas.ts)
- **Оптимизация запросов** — `fetchFullHierarchy()` делает один запрос вместо N+1
- **ImageKit** — грамотная утилита с DPR, LQIP-плейсхолдерами
- **Мемоизация** — секции на главном экране обёрнуты в `useMemo`
- **Realtime** — заказы обновляются через Supabase Realtime
- **Декомпозиция address-компонентов** — разбиты на `AddressMainSection`, `AddressDetailsSection`, `AddressCommentSection`, `AddressActionButtons`
- **Тестирование** — есть `__tests__/` для stores, components и lib

## 🎯 Рекомендуемый порядок исправлений

1. ~~**SMS API ключ** → перенести в `.env` (5 мин)~~ ✅  
2. ~~**OTP в алерте** → показывать код только в `__DEV__` (2 мин)~~ ✅  
3. ~~**`deleteAddress` без user_id** → добавить фильтр (2 мин)~~ ✅  
4. ~~**`favoriteStore` — откат оптимистичного апдейта** (10 мин)~~ ✅  
5. **`markAddressAsSelected` — гонка** → RPC-функция в Supabase (~15 мин)  
6. **Предсказуемый пароль** → HMAC с секретом из env (~30 мин)  
7. **`any` → типизация** в orderApi, authApi, logger (~30 мин)  
8. **Прямые Supabase-вызовы** → мигрировать на lib/\*Api.ts (~1-2 часа)  
9. **Декомпозиция login.tsx** → компоненты (~30 мин)  
10. **Остальные P2** → по ходу работы (Boy Scout Rule)
