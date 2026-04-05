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

### ~~6. `addressStore` обращается к `supabase` напрямую~~ ✅ FIXED

**Исправлено**: Вызовы `supabase.auth.getSession()` в `addressStore.ts` заменены на использованеие `getSession()` из слоя `authApi.ts`. `favoriteStore.ts` тоже больше не использует Supabase напрямую.

---

### ~~7. `favoriteStore.toggleFavorite` — оптимистичное обновление без отката~~ ✅ FIXED

**Файл**: [favoriteStore.ts](file:///d:/Dev/JS%20projects/grocery-app/store/favoriteStore.ts#L38)

**Исправлено**: Перед оптимистичным апдейтом сохраняется `previousIds = [...favoriteIds]`. В `catch` — `set({ favoriteIds: previousIds })` откатывает UI к предыдущему состоянию.

---

## 🟡 Серьёзные (P1) — Типизация и архитектура

### ~~8. `any` в продакшен-коде (нарушение Strict Typing)~~ ✅ FIXED

**Исправлено**: Все упоминания `any` в `orderApi`, `authApi`, `logger`, а также на экранах `index.tsx` и `cart/index.tsx` заменены на строгие интерфейсы или `unknown` (для логгера и ошибок). Проверка `tsc --noEmit` проходит без ошибок.

---

---

### ~~9. `authApi.fetchUserProfile` — нет return type~~ ✅ FIXED

**Исправлено**: Добавлены явные типы возвращаемых значений (`Promise<Profile | null>`, `Promise<Session | null>`) для всех функций в `authApi.ts`.

---

---

### ~~10. Прямые вызовы Supabase из экранов (минуя сервисный слой)~~ ✅ FIXED

**Исправлено**: Все 13 экранов мигрированы на сервисный слой. Создан `lib/adminApi.ts` (12 функций для admin-операций), добавлен `fetchProductsByIds` в `productsApi.ts`. Экраны больше не содержат прямых `supabase.from(...)` вызовов (кроме Realtime-подписок и `auth.signOut`).

---

### ~~11. `console.error` вместо `logger.error`~~ ✅ FIXED

**Исправлено**: `console.error` в `edit-profile.tsx` заменён на `logger.error`.

---

### ~~12. `types/index.ts` vs `types/supabase.ts` — рассинхрон~~ ✅ FIXED

**Исправлено**: Типы в `types/index.ts` теперь импортируют Enum-типы из `supabase.ts`. Добавлен `avatar_url` в профиль. Скрипт `supabase:types` запущен для актуализации схемы.

---

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
| 🔴 **P0 — Критические** | 7 | ✅ 5 (#1, #2, #4, #6, #7) | ❌ 2 (#3, #5) |
| 🟡 **P1 — Серьёзные** | 10 | ✅ 5 (#8, #9, #10, #11, #12) | ❌ 5 |
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
7. ~~**`any` → типизация** в orderApi, authApi, logger (~30 мин)~~ ✅  
8. ~~**Return types & Type Sync** (#9, #12)~~ ✅  
9. ~~**Прямые Supabase-вызовы** → мигрировать на lib/\*Api.ts (~1-2 часа)~~ ✅  
10. **Декомпозиция login.tsx** → компоненты (~30 мин)  
11. **Остальные P2** → по ходу работы (Boy Scout Rule)
