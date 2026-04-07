# 📋 Актуальный Бэклог Grocery App

Этот файл содержит список приоритетных задач для реализации. Разработка ведется итеративно, согласно принципам «Soft Minimalism».

---

# 🚀 БЛОК 1: MVP — Критичные для Запуска

## 📱 Авторизация
- [ ] Привязка профиля к номеру телефона
- [x] Обязательность имени при авторизации

## 💳 Платёжная система
- [ ] Интеграция платёжного шлюза (Stripe / ЮKassa / CloudPayments)
- [ ] Выбор способа оплаты: онлайн / наличными курьеру / картой курьеру
- [ ] Чек и фискализация (54-ФЗ для РФ)
- [ ] Таблица payment_methods: типы, комиссии, статусы

## 🚚 Доставка
- [ ] Зона доставки — проверка адреса (да/нет доставляем)
- [ ] Стоимость доставки — минимум / фикс / по сумме / по расстоянию
- [ ] Слоты доставки — время доставки (11:00-13:00, 14:00-16:00 и т.д.)
- [ ] БД: таблицы delivery_zones, delivery_slots, delivery_rates

## 👥 Сборщики и Курьеры
- [ ] Отдельная роль «Сборщик» (picker) — экран назначенных заказов на сборку
- [ ] Отдельная роль «Курьер» (courier) — маршрутный лист и навигация
- [ ] Приложение для курьеров — звонок клиенту, подтверждение доставки
- [ ] Админ-панель — назначение заказов на сборщиков/курьеров
- [ ] Таблица staff_assignments: order_id, staff_type, staff_id, status

## 📄 Юридическое
- [ ] Политика конфиденциальности (152-ФЗ)
- [ ] Публичная оферта
- [ ] Согласие на обработку перс. данных (при регистрации)

## 🔧 Операционное
- [ ] Управление остатками — списание при заказе
- [ ] Аналитика — продажи, топ товаров, средний чек
- [ ] Оповещения — когда мало товара на складе
- [ ] БД: таблица analytics, triggers для stock alerts

---

# 🔍 БЛОК 2: Аудит (07.04.2026)

## 🔐 Аудит Безопасности — 6 задач

### 🔴 Критичные

- [ ] **RLS для `otp_codes`** — Любой может читать и менять чужие OTP коды. Переписать политики: запретить публичный SELECT/UPDATE, оставить только через `service_role`. (`supabase/migrations/`)
- [ ] **Cloudflare R2 Secret Key в клиентском бандле** — `EXPO_PUBLIC_R2_SECRET_ACCESS_KEY` попадает в бандл. Перенести загрузку в R2 через Supabase Edge Function с presigned URL. Это также уберёт `@aws-sdk/` (~8.6 MB) из бандла. (`.env.local`)
- [ ] **Сменить `SUPABASE_DB_PASSWORD`** — Пароль БД хранится в plaintext в `.env`. Сменить в дашборде Supabase, удалить переменную из `.env`.

### 🟠 Высокие

- [ ] **Удалить закомментированные продакшн-ключи** — В `.env` закомментированы URL и Anon Key от продакшн-инстанса Supabase. Удалить строки, проверить git-историю.
- [ ] **Дублирующиеся RLS политики для `categories`** — Два идентичных `SELECT` policy (`Allow select for all` и `Categories are viewable by everyone`). Удалить один. (`supabase/migrations/`)

### 🟡 Средние

- [ ] **Логирование номеров телефонов** — `logger.log/warn` в `AuthProvider.tsx` (строки 41, 55, 61) выводит реальные номера телефонов. Убрать номер из аргументов логгера. (`providers/AuthProvider.tsx`)

---

## 🗄️ Аудит Supabase — 4 задачи

### 🔴 Критичные — дыры в RLS

- [ ] **Таблица `addresses`** — нет политик `SELECT` и `INSERT` (открыто для всех) → добавить политики с `auth.uid() = user_id`
- [ ] **Таблица `order_items`** — нет политик `UPDATE` и `DELETE` → добавить защиту через ownership заказа
- [ ] **Таблица `otp_codes`** — `UPDATE` открыт для всех (дополняет задачу из Безопасности) → ограничить через `service_role`

### 🟠 Типы

- [ ] **`types/supabase.ts`** — отсутствует поле `image_transformations` в таблице `categories` (добавлено миграцией, но типы не регенерированы) → запустить `npm run supabase:types`

---

## 🏗️ Аудит Архитектуры — 13 задач

### 🟠 Прямые Supabase запросы в UI (вынести в lib/)

- [ ] **`app/(tabs)/(profile)/index.tsx:60`** — `supabase.auth.signOut()` прямо в экране → вынести в `lib/api/authApi.ts`
- [ ] **`components/cart/CartRecommendations.tsx:23`** — `supabase.from('products')` в компоненте → использовать уже существующий `fetchRecommendedProducts()` из lib
- [ ] **`app/setup-profile.tsx:38`** — `supabase.from('profiles').upsert()` в экране → вынести в `lib/api/authApi.ts`

### 🟠 `useRouter()` в компонентах — передавать callback от родителя

- [ ] **`components/product/ProductCard.tsx`** — `router.push('/product/...')` → принимать `onPress` как пропс
- [ ] **`components/cart/CartItem.tsx`** — `router.push('/product/...')` → принимать `onPress` как пропс
- [ ] **`components/category/SubcategoryCard.tsx`** — `router.push('/category/...')` → принимать `onPress` как пропс
- [ ] **`components/product/ProductRelated.tsx`** — `router.push('/product/...')` → принимать `onPress` как пропс
- [ ] **`components/cart/EmptyCart.tsx`** — `router.push('/(tabs)/(index)')` → принимать `onPress` как пропс

### 🟠 Структура папок

- [ ] **Объединить `utils/` и `lib/utils/`** — в корне есть отдельная папка `utils/` (`addressFormatter.ts`, `imageKit.ts`, `mosaicLayout.ts`, `slugify.ts`). Перенести всё в `lib/utils/` и обновить импорты.

### 🟡 Дублирование кода

- [ ] **`useImagePicker()` хук** — логика `pickImage()` продублирована в `add-product.tsx`, `edit-product.tsx`, `CategoryFormModal.tsx`. Вынести в общий хук.
- [ ] **`useCategoryList()` хук** — загрузка категорий дублируется в `add-product.tsx`, `edit-product.tsx`, `CategoryFormModal.tsx`. Вынести в общий хук.
- [ ] **`showAlert()` утилита** — разница между `.tsx` и `.web.tsx` версиями admin-экранов только в `Alert` vs `window.alert`. Создать `lib/utils/platformUtils.ts` с `showAlert()`.
- [ ] **Объединить `add-product.tsx` и `edit-product.tsx`** — 85% идентичного кода. Создать общий `ProductFormScreen` с параметром `mode: 'add' | 'edit'`.

---

## 🧹 Аудит Качества Кода — 9 задач

### 🟠 useCallback — отсутствует мемоизация

- [ ] **`app/(admin)/catalog.tsx`** — `handleEdit`, `handleDelete` передаются как пропсы без `useCallback`
- [ ] **`app/(admin)/orders.tsx`** — `handleUpdateStatus`, `callCustomer`, `toggleExpand` без `useCallback`
- [ ] **`app/(tabs)/(cart)/index.tsx`** — `formatAddress` передаётся в `CartSummary` без `useCallback`

### 🟠 HEX/rgba напрямую вместо токенов

- [ ] **`app/(admin)/add-product.tsx:182`** — `#fff` → заменить на `Colors.light.white`
- [ ] **`app/(admin)/edit-product.tsx:211`** — `#fff` → заменить на `Colors.light.white`
- [ ] **`components/address/AddressActionButtons.tsx:36`** — `#059669` в LinearGradient → использовать `Colors.light.primary`

### 🟡 testID — низкое покрытие (~27%)

- [ ] **`components/admin/AdminCategoryPicker.tsx`** — нет ни одного `testID` на интерактивных элементах
- [ ] **`components/address/AddressSearchInput.tsx`** — нет `testID` на `TextInput` и элементах подсказок
- [ ] **Экраны профиля** — минимальное покрытие, добавить `testID` на кнопки и поля

---

## ⚡ Аудит Производительности — 12 задач

### 🟠 Селекторы в сторах — подписка на весь стор вместо конкретных полей

- [ ] **`components/product/ProductCard.tsx`** — `useCartStore()` целиком вместо 3 селекторов → перерендер карточки при изменении любого поля корзины
- [ ] **`app/(tabs)/(cart)/index.tsx:20`** — `useCartStore()` с деструктуризацией 7 полей → разбить на отдельные селекторы
- [ ] **`app/(tabs)/(index)/index.tsx:28`** — 3 стора подключены целиком (`useCategoryStore`, `useCartStore`, `useAddressStore`) → разбить на селекторы
- [ ] **`app/category/[id].tsx:25`** — `useCategoryStore()` целиком для 3 функций → селекторы
- [ ] **`app/product/[id].tsx:31`** — `useCartStore()` + `useFavoriteStore()` целиком → селекторы
- [ ] **`app/favorites.tsx:27`** — `useFavoriteStore()` целиком → селектор на `favoriteIds`
- [ ] **`app/addresses.tsx:13`** — `useAddressStore()` целиком → селекторы
- [ ] **`hooks/useCheckout.ts:20`** — `useCartStore()` + `useAddressStore()` целиком → селекторы

### 🟡 FlatList — отсутствует `getItemLayout`

- [ ] **`app/category/[id].tsx`** — FlatList с `ProductCard` (фиксированная высота) → добавить `getItemLayout`
- [ ] **`app/search.tsx`** — FlatList с `ProductCard` → добавить `getItemLayout`
- [ ] **`app/favorites.tsx`** — FlatList с `ProductCard` → добавить `getItemLayout`

### 🟡 useEffect — потенциальный двойной вызов

- [ ] **`app/favorites.tsx:56`** — `fetchFavoriteProducts` и `favoriteIds` оба в зависимостях создают цепочку перезапусков. Убрать `fetchFavoriteProducts` из зависимостей `useCallback`, оставить только `[session, favoriteIds]` в `useEffect`

---

## 🎨 Аудит UI / Soft Minimalism — 16 задач

### 🔴 Критичные

- [ ] **`app/(admin)/add-product.tsx`** — цветная тень: `shadowColor: Colors.light.primary`, `shadowOpacity: 0.3`, `elevation: 4` → заменить на `...Shadows.md`
- [ ] **`app/(admin)/edit-product.tsx`** — то же самое, что и `add-product.tsx`
- [ ] **`components/admin/AdminCategoryPicker.tsx`** — `SafeAreaView` импортируется из `react-native` вместо `react-native-safe-area-context`

### 🟠 Тени

- [ ] **Унифицировать `shadowColor` по всему проекту** — часть компонентов использует `Colors.light.text`, часть `Colors.light.primary` (нарушение Soft Minimalism). Привести всё к `Colors.light.text` с `shadowOpacity: 0.03–0.05`

### 🟠 Скругления — магические числа вместо токенов

- [ ] **`components/cart/CartSummary.styles.ts`** — карточки адреса и платежа: `borderRadius: 18/22` → `Radius.xxl (24)`
- [ ] **`components/product/ProductBottomBar.tsx`** — кнопка: `borderRadius: 19` → `Radius.pill`
- [ ] **`components/order/OrderSection.tsx`** — карточка: `borderRadius: 20` → `Radius.xxl (24)`
- [ ] **`app/(tabs)/(profile)/index.tsx`** — аватар: `borderRadius: 28/40` → `Radius.xxl (24)`
- [ ] **`app/favorites.tsx`** — иконка: `borderRadius: 40` → `Radius.xxl (24)`
- [ ] **`components/cart/CartItem.tsx`** — quantity control: `borderRadius: 14` → `Radius.m (12)`
- [ ] **Прочие компоненты** — 15+ файлов с числовыми `borderRadius` → систематически заменить на `Radius.*` токены

### 🟠 Отступы — магические числа вместо токенов

- [ ] **`app/(tabs)/(profile)/index.tsx`** — `paddingHorizontal: 20/30`, `paddingVertical: 12` → `Spacing.*`
- [ ] **`components/product/ProductBottomBar.tsx`** — `paddingVertical: 20/18`, `paddingHorizontal: 36` → `Spacing.*`
- [ ] **`components/cart/CartSummary.styles.ts`** — 5 нарушений: `padding: 20`, `paddingHorizontal: 20/12`, `paddingVertical: 6` → `Spacing.*`
- [ ] **`app/(auth)/_login.styles.ts`** и **`app/setup-profile.tsx`** — `paddingTop/Bottom: 60` → `Spacing.*`
- [ ] **Прочие файлы** — ~30+ файлов с числовыми padding/margin → систематически заменить на `Spacing.*` токены

---

## 🧪 Аудит Тестов — 8 задач

### 🟠 Покрытие — критически низкое

- [ ] **`store/favoriteStore.ts`** — нет ни одного теста на критичный стор → написать тесты (actions: add, remove, toggle, sync)
- [ ] **`store/appStore.ts`** — нет тестов → написать базовые тесты инициализации
- [ ] **Компоненты корзины** — `CartSummary`, `CheckoutButton`, `PaymentSelector`, `EmptyCart` не покрыты → написать тесты
- [ ] **Компоненты авторизации** — `PhoneStep`, `OtpStep` не покрыты → написать тесты
- [ ] **`components/ui/ScreenHeader.tsx`**, **`ErrorBoundary.tsx`** — нет тестов → написать базовые тесты рендера
- [ ] **Тесты для `.web.tsx` компонентов** — `CategoryFormModal.web`, `catalog.web`, `categories.web`, `orders.web`, `add-product.web`, `edit-product.web` → написать unit-тесты

### 🟡 Актуальность тестов

- [ ] **`OrderCard.test.tsx`** — `status: 'delivered'` задан как string вместо `Enums<'order_status'>` → привести к правильному типу
- [ ] **`CartItem.test.tsx`** и **`ProductCard.test.tsx`** — дублируют мок `useRouter` который уже есть в `jest.setup.js` → удалить локальные переопределения

---

## 🧩 Аудит Обязательных Компонентов — 10 задач

### 🟠 ScreenHeader — отсутствует на 11 экранах

- [ ] **`app/setup-profile.tsx`** — кастомная шапка с LinearGradient → заменить на `<ScreenHeader />`
- [ ] **`app/search.tsx`** — самописная навигационная панель → заменить на `<ScreenHeader />`
- [ ] **`app/category/[id].tsx`** — кастомный header с back button → заменить на `<ScreenHeader />`
- [ ] **`app/product/[id].tsx`** — back button внутри `ProductHeader` → заменить на `<ScreenHeader />`
- [ ] **`app/order/[id].tsx`** — кастомный header → заменить на `<ScreenHeader />`
- [ ] **`app/(admin)/`** — все 6 файлов без `<ScreenHeader />` → добавить

### 🟠 Skeleton — ActivityIndicator вместо Skeleton

- [ ] **`app/search.tsx`** — `<ActivityIndicator />` при загрузке → заменить на `<Skeleton />`
- [ ] **`app/(admin)/catalog.tsx`**, **`categories.tsx`**, **`orders.tsx`**, **`add-product.tsx`**, **`edit-product.tsx`** — `ActivityIndicator` → заменить на `<Skeleton />`

### 🟡 ProductCard — самописные карточки

- [ ] **`components/home/PopularSection.tsx`** — кастомная карточка товара → заменить на `<ProductCard />`
- [ ] **`app/(admin)/catalog.tsx`** — функция `renderProduct` с кастомной разметкой → заменить на `<ProductCard />`

---

# 💎 БЛОК 3: Развитие

## 💎 Продаваемость и Рекомендации

### Система скидок и промокодов
- [ ] Поле промокода в чеке корзины (валидация через Supabase)
- [ ] Countdown-таймеры на ограниченные акции
- [ ] БД: таблицы discounts, promo_codes, loyalty_levels, promotions

### Умные рекомендации
- [ ] **"Вы смотрели"** — таблица product_views, секция в ProductScreen (3-4 товара)
- [ ] **Cross-sell "С этим покупают"** — таблица related_products, логика комплементарных товаров
- [ ] **На основе истории заказов** — анализ покупок, секция "Рекомендуем для вас"
- [ ] Админ-панель — настройка связей товаров и приоритетов

## 📢 Маркетинг

### Push-уведомления (FCM)
- [ ] Настройка серверных пушей через Firebase Cloud Messaging
- [ ] Триггеры уведомлений из Supabase при смене статуса заказа
- [ ] Уведомления в фоновом режиме
- [ ] "Цена на X снизилась!" — с глубинной ссылкой на товар

### Реферальная система
- [ ] Реферальные коды для пользователей
- [ ] Бонус приглашившему — скидка/баллы
- [ ] Бонус приглашённому — первая доставка бесплатно/скидка
- [ ] БД: таблица referrals, поле referral_code в profiles

## 📦 Наполнение контента

### Категории
- [x] Финальный список 18+ категорий (Лавка-стайл)
- [ ] Массовая загрузка категорий в БД через SQL или Админ-панель
- [ ] Массовая загрузка продуктов в БД через Админ-панель (excel)

## 🛠️ Предстоящие Этапы (Refactoring & Features)

### 🧺 Фаза 5: Оптимизация корзины и оформления заказа
- [x] Рефакторинг `CartStore.ts`: вынос логики расчета и скидок.
- [x] Оптимизация экрана корзины: декомпозиция на модульные компоненты.
- [x] Улучшение UX выбора способа оплаты и адреса внутри корзины.
- [ ] Анимации добавления и удаления товаров (LayoutAnimations).

### 👨‍💻 Админ-панель: Управление продуктами
- [ ] Интерфейс редактирования КБЖУ (белки, жиры, углеводы, калории) в карточке товара.
- [ ] Массовое управление данными КБЖУ для списка продуктов.
- [ ] Интеграция валидации полей через Zod в `ProductFormModal.tsx`.
- [ ] Управление тегами товаров

## ✨ Полировка и UX

## ⚡ Оптимизация и Кеширование

### Полировка системы изображений
- [ ] **Увеличить таймаут данных** — Вернуть `CACHE_TIMEOUT` с 1 минуты до 10-15 минут в `categoryStore.ts` (снижение нагрузки на БД).
- [ ] **Умное версионирование картинок (Smart Cache Busting)** — В `SubcategoryCard.tsx` использовать `v=subcategory.updated_at` вместо глобального `lastFetch`. (Чтобы перекачивались только реально измененные картинки).
- [ ] **Оптимизация CDN** — Проанализировать использование трафика ImageKit и настроить более агрессивное сжатие для бюджетных устройств.

### Анимации и Переходы
- [ ] **Shared Element Transitions** — плавная анимация карточки товара при переходе на экран деталей (`ProductScreen`).
- [ ] **Lottie-анимации** — для пустых состояний (пустая корзина, поиск не дал результатов).
- [ ] **Haptic Feedback** — тактильный отклик при добавлении товара в корзину и переключении табов.

---

# 🛠️ БЛОК 4: Технический долг и Багфикс

- [ ] **Проверить отображение комментария курьеру в админской панели в заказах.** (Убедиться, что текст, введенный пользователем, корректно доходит до курьера/сборщика).
- [x] **Редизайн экрана "Профиль".** (Привести экран к премиальному стилю Soft Minimalism: переработать карточки, списки и общий вид).

### ✅ Выполнено
- [x] **Удалить debug-логи** — Найти и удалить все `console.log` в продакшн-коде.
- [x] **Fallback для не-ImageKit URL** — Проверка `ik.imagekit.io` в `utils/imageKit.ts` ломает обычные URL. Добавлен graceful fallback.
- [x] **Валидация env-переменных для R2** — Добавлены проверки в `storageUtils.ts`.
- [x] **Lazy-loading AWS SDK** — Исследовано. Metro не поддерживает code-splitting, SDK остаётся в бандле → решение через Edge Function (см. 🔐 Безопасность).
- [x] **Адаптивные размеры изображений** — Хардкод заменён на расчёт по реальным размерам контейнера.
- [x] **Кастомный хук для изображений** — Вынесен `useImageKit` хук.
- [x] **Унифицировать transition time** — `300ms` / `500ms` вынесены в тему.
- [x] **Pill-радиус на Android** — Исследовано, `Radius.pill = 999` заменён на `100`.
