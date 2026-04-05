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

### ~~3. Генерация пароля из телефона — предсказуемая~~ ✅ FIXED

**Файл**: `lib/authUtils.ts` (ранее `lib/sms.ts`)

**Исправлено**: Старая предсказуемая генерация заменена на криптографически безопасный алгоритм `HMAC-SHA256` (используя библиотеку `crypto-js`). Для подписи используется супер-секретный ключ `EXPO_PUBLIC_AUTH_SECRET_KEY` из файлов `.env`. Логика генерации пароля и email полностью отделена от `lib/sms.ts`, что подготовило почву для лёгкого внедрения Flashcall в будущем.

---

### ~~4. `deleteAddress` не проверяет `user_id`~~ ✅ FIXED

**Файл**: [addressApi.ts](file:///d:/Dev/JS%20projects/grocery-app/lib/addressApi.ts#L54)

**Исправлено**: Сигнатура изменена на `deleteAddress(userId, id)`. Добавлен `.eq('user_id', userId)`. Вызов в `addressStore.removeAddress` обновлён с получением сессии.

---

### ~~5. Гонка состояний при выборе адреса (`markAddressAsSelected`)~~ ✅ FIXED

**Файл**: `lib/addressApi.ts`

**Исправлено**: Два последовательных `await supabase...update()` заменены на вызов атомарной RPC-функции `await supabase.rpc('select_delivery_address')`. Теперь сброс старого адреса и выбор нового происходит за одну миллисекунду на уровне базы данных PostgreSQL без риска разрыва (race condition).

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

### ~~13. Дублирование логики в `lib/address.ts` и `lib/addressUtils.ts`~~ ✅ FIXED

**Исправлено**: Логика консолидирована в `lib/addressUtils.ts`. Файл `lib/address.ts` удалён. `utils/addressFormatter.ts` теперь использует общую утилиту `cleanAddress` с параметрами. Устранено тройное дублирование регулярок очистки "г. Буйнакск".

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

### ~~15. `appStore.ts` — мёртвый импорт~~ ✅ FIXED

**Файл**: [appStore.ts](file:///d:/Dev/JS%20projects/grocery-app/store/appStore.ts)

**Исправлено**: Удален неиспользуемый импорт `AsyncStorage`.

---

### ~~16. `useCheckout` — неиспользуемые импорты~~ ✅ FIXED

**Файл**: [useCheckout.ts](file:///d:/Dev/JS%20projects/grocery-app/hooks/useCheckout.ts)

**Исправлено**: Удален неиспользуемый импорт `addressApi`.

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
| 🔴 **P0 — Критические** | 7 | ✅ 7 (#1, #2, #3, #4, #5, #6, #7) | ❌ 0 |
| 🟡 **P1 — Серьёзные** | 10 | ✅ 8 (#8, #9, #10, #11, #12, #13, #15, #16) | ❌ 2 |
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
5. ~~**`markAddressAsSelected` — гонка** → RPC-функция в Supabase (~15 мин)~~ ✅  
6. **Предсказуемый пароль** → HMAC с секретом из env (~30 мин)  
7. ~~**`any` → типизация** в orderApi, authApi, logger (~30 мин)~~ ✅  
8. ~~**Return types & Type Sync** (#9, #12)~~ ✅  
9. ~~**Прямые Supabase-вызовы** → мигрировать на lib/\*Api.ts (~1-2 часа)~~ ✅  
10. **Декомпозиция login.tsx** → компоненты (~30 мин)  
11. **Остальные P2** → по ходу работы (Boy Scout Rule)
