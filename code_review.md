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

### ~~14. Компоненты без `testID` на интерактивных элементах~~ ✅ FIXED

Правило: `code-standards.md` — *«Сразу добавлять testID новым компонентам»*.

Компоненты **с** testID (✅): `AddressSearchInput`, `CartItem`, `CartSummary`, `ProductCard`, `SubcategoryCard`, `OrderCard`, `EmptyCart`, `FloatingCheckoutButton`, `CategoryItem`, `CategoryFormModal`.

Компоненты/экраны **c** встроенными testID (исправлено):
- `login.tsx` (внутри PhoneStep и OtpStep)
- `edit-profile.tsx`
- `addresses.tsx`
- `manage-address.tsx`
- `ScreenHeader.tsx`

---

### ~~15. `appStore.ts` — мёртвый импорт~~ ✅ FIXED

**Файл**: [appStore.ts](file:///d:/Dev/JS%20projects/grocery-app/store/appStore.ts)

**Исправлено**: Удален неиспользуемый импорт `AsyncStorage`.

---

### ~~16. `useCheckout` — неиспользуемые импорты~~ ✅ FIXED

**Файл**: [useCheckout.ts](file:///d:/Dev/JS%20projects/grocery-app/hooks/useCheckout.ts)

**Исправлено**: Удален неиспользуемый импорт `addressApi`.

---

### ~~17. `login.tsx` — файл на ~450 строк~~ ✅ FIXED

Правило: *«Если файл или компонент превышает 200 строк, предлагать его декомпозицию»* (GEMINI.md).

**Исправлено**: Логика декомпозирована в `PhoneStep` и `OtpStep`. Стили вынесены в `login.styles.ts`. Файл сокращён почти в 3 раза.

---

### ~~18. Комментарии на английском~~ ✅ FIXED

**Исправлено**: Все комментарии в `theme.ts`, `storageUtils.ts` и `NotificationService.ts` переведены на русский язык. Технические термины (hover, toast) заменены на русские аналоги.

---

### ~~19. Пустой `useEffect` без тела~~ ✅ FIXED

**Исправлено**: Удален бесполезный хук в `app/(tabs)/(index)/index.tsx`, который не выполнял никакой логики.

---

### ~~20. `fetchRecommended` в favorites.tsx зависит от `recommended.length`~~ ✅ FIXED

**Файл**: [favorites.tsx](file:///d:/Dev/JS%20projects/grocery-app/app/favorites.tsx#L26)

**Исправлено**: Использован `useRef (isRecommendedFetched)`, чтобы отвязать функцию от стейта и предотвратить циклическое пересоздание `useCallback`. Стейт используется только для отображения.

---

### ~~21. `home/index.tsx` — 414 строк (нужна декомпозиция)~~ ✅ FIXED

**Исправлено**: Файл декомпозирован с 414 до ~130 строк. Вынесены компоненты:
- `components/home/HomeHeader.tsx` — анимированный хедер (приветствие, адрес, поиск)
- `components/home/BannersSection.tsx` — секция «Акции и новинки»
- `components/home/PopularSection.tsx` — секция «Популярное» с карточками товаров
- `components/home/index.styles.ts` — все стили главного экрана

---

### ~~22. `NotificationService.ts` — `token` всегда `undefined`~~ ✅ FIXED

**Исправлено**: Удалена неиспользуемая переменная `token`, возвращаемый тип функции изменен на `Promise<void>`, так как приложение использует только локальные уведомления и токены не требуются.

---

### ~~23. `CartSummary` экспортирует тип `PaymentMethod`, но определение не видно~~ ✅ FIXED

**Исправлено**: Типы `PaymentMethod` и `Address` перенесены в централизованный файл `types/index.ts`. Все зависимые компоненты и хуки обновлены для импорта из `@/types`.

---

### ~~24. `AddressSearchInput.tsx` — 230 строк~~ ✅ FIXED

**Исправлено**: Стили вынесены в отдельный файл `components/AddressSearchInput.styles.ts`. Компонент сокращён до ~170 строк.

---

### ~~25. Отсутствует обработка ошибки `Haptics` на Web~~ ✅ FIXED

**Исправлено**: Вызовы `Haptics` обернуты в проверку `Platform.OS !== 'web'`, чтобы предотвратить ошибки в браузерах.

---

### ~~26. `CartSummary.tsx` — файл на ~330 строк (нужна декомпозиция)~~ ✅ FIXED

**Исправлено**: Файл декомпозирован с 324 до ~75 строк. Вынесены:
- `components/cart/CartSummary.styles.ts` — все стили
- `components/cart/AddressSelector.tsx` — секция выбора адреса
- `components/cart/PaymentSelector.tsx` — секция выбора оплаты
- `components/cart/OrderReceipt.tsx` — секция «Детали заказа»
- `components/cart/CheckoutButton.tsx` — кнопка «Оформить заказ»

---

## 📊 Сводка

| Уровень | Всего | Закрыто | Осталось |
|---|---|---|---|
| 🔴 **P0 — Критические** | 7 | ✅ 7 (#1, #2, #3, #4, #5, #6, #7) | ❌ 0 |
| 🟡 **P1 — Серьёзные** | 10 | ✅ 10 (#8, #9, #10, #11, #12, #13, #14, #15, #16, #17) | ❌ 0 |
| 🟢 **P2 — Незначительные** | 9 | ✅ 9 (#18, #19, #20, #22, #23, #24, #25, #21, #26) | ❌ 0 |

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
6. ~~**Предсказуемый пароль** → HMAC с секретом из env (~30 мин)~~ ✅  
7. ~~**`any` → типизация** в orderApi, authApi, logger (~30 мин)~~ ✅  
8. ~~**Return types & Type Sync** (#9, #12)~~ ✅  
9. ~~**Прямые Supabase-вызовы** → мигрировать на lib/\*Api.ts (~1-2 часа)~~ ✅  
10. ~~**Декомпозиция login.tsx** → компоненты (~30 мин)~~ ✅  
11. ~~**Остальные P2** → по ходу работы (Boy Scout Rule)~~ ✅
