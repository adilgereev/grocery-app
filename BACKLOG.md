# 📋 Актуальный Бэклог Grocery App

Этот файл содержит список приоритетных задач для реализации. Разработка ведется итеративно, согласно принципам «Soft Minimalism».

---

# 🚀 БЛОК 1: MVP — Критичные для Запуска

## 💳 Платёжная система
- [ ] Интеграция платёжного шлюза (Stripe / ЮKassa / CloudPayments)
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

## 🏗️ Аудит Архитектуры

### 🟡 useRouter() в компонентах — передавать callback от родителя
- [ ] **`components/home/PopularSection.tsx`** — кастомная карточка с прямым `router.push`

## 🧹 Аудит Качества Кода

### 🟡 testID — низкое покрытие (~27%)
- [ ] **`components/admin/AdminCategoryPicker.tsx`** — нет ни одного `testID` на интерактивных элементах
- [ ] **`components/address/AddressSearchInput.tsx`** — нет `testID` на `TextInput` и элементах подсказок
- [ ] **Экраны профиля** — минимальное покрытие, добавить `testID` на кнопки и поля
## 🧪 Аудит Тестов

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
- [ ] Массовая загрузка категорий в БД через SQL или Админ-панель
- [ ] Массовая загрузка продуктов в БД через Админ-панель (excel)

## 🛠️ Предстоящие Этапы (Refactoring & Features)

### 👨‍💻 Админ-панель: Управление продуктами
- [ ] Интерфейс редактирования КБЖУ (белки, жиры, углеводы, калории) в карточке товара.
- [ ] Массовое управление данными КБЖУ для списка продуктов.
- [ ] Интеграция валидации полей через Zod в `ProductFormModal.tsx`.
- [ ] Управление тегами товаров
- [ ] Функционал скрытия категорий (visibility toggle) в админ-панели.
- [ ] Функционал сворачивания категории (accordion/collapse) в списке админки.

---

# 🛠️ БЛОК 4: Технический долг и Багфикс

- [ ] **Проверить отображение комментария курьеру в админской панели в заказах.** (Убедиться, что текст, введенный пользователем, корректно доходит до курьера/сборщика).


---

# ✅ Архив — Закрытые задачи

## 🧩 Аудит Обязательных Компонентов (07.04.2026)

### ScreenHeader — отсутствует на некоторых экранах
- [x] **`app/setup-profile.tsx`** — намеренно без `<ScreenHeader />`: экран стиля онбординга (как login), кастомная decorative-шапка
- [x] **`app/product/[id].tsx`** — намеренно без `<ScreenHeader />`: overlay-кнопки поверх fullscreen-фото — стандарт для экрана товара (см. `ProductHeader`)
- [x] **`app/(admin)/`** — все 6 файлов: нативный Stack-header → `<ScreenHeader />` ✅

### ProductCard — самописные карточки
- [x] **`components/home/PopularSection.tsx`** — кастомная карточка товара → заменено на `<ProductCard />` ✅
- [x] **`app/(admin)/catalog.tsx`** — `renderProduct` намеренно кастомная: admin-строка с кнопками «Изменить/Удалить», не клиентская карточка покупки

## 🎨 Аудит UI / Soft Minimalism (обновлён 09.04.2026)

### ✅ Тени — закрыто
- [x] **`shadowColor` унифицирован** — все компоненты используют `...Shadows.sm/md/lg` токены. Прямых `shadowColor` в компонентах нет ✅

### ✅ Скругления — закрыто
- [x] **`ProductBottomBar.tsx`** — `addToCartButton` → `Radius.pill` ✅
- [x] **`OrderSection.tsx`** — `sectionCard` → `Radius.xl` ✅
- [x] **`CartItem.tsx`** — `quantityControl` → `Radius.xxl` ✅
- [x] **`ProductBottomBar.tsx`** — `quantityContainer` → `Radius.xxl` ✅
- [x] **`components/cart/CartSummary.styles.ts`** — `addressSelector` + `paymentOption borderRadius: 18` → `Radius.xxl` ✅
- [x] **`components/cart/CartSummary.styles.ts`** — `checkoutButton borderRadius: 100` → `Radius.pill` ✅
- [x] **`components/order/OrderTracker.tsx`** — `trackerDot` 36×36, `borderRadius: 18` → `Radius.pill` ✅
- [x] **`components/product/ProductHeader.tsx`** — `iconButton` 44×44, `borderRadius: 22` → `Radius.pill` ✅
- [x] **`app/(admin)/catalog.tsx`** + **`catalog.web.tsx`** — `sectionBadge borderRadius: 12` → `Radius.m` ✅
- [x] **`CartSummary.styles.ts`** — `paymentIconContainer` 44×44 → `Radius.pill` ✅
- [x] **`ProductBottomBar.tsx`** — `quantityButton` 38×38 → `Radius.pill` ✅
- [x] **`OrderSection.tsx`** — `iconContainer` 40×40 → `Radius.pill` ✅
- [x] **`profile/index.tsx`** — `guestAvatarIcon` 80×80 + `avatar` 56×56 → `Radius.pill` ✅
- [x] **`favorites.tsx`** — `emptyIconCircle` 80×80 → `Radius.pill` ✅
- [x] **`EmptyCart.tsx`** — `emptyIconCircle` 80×80 → `Radius.pill` ✅
- [x] **`ErrorBoundary.tsx`** — `iconBackground` 100×100 → `Radius.pill` ✅
- [x] **`FloatingCheckoutButton.tsx`** — `floatingCheckoutButton` → `Radius.pill` ✅
- [x] **`CartItem.tsx`** — `circleButton` 28×28 → `Radius.pill`; `itemImage` 60×60 → `Radius.xxl` ✅
- [x] **`AddressMainSection.tsx`** — `switchBase` + `switchThumb` → `Radius.pill` ✅
- [x] **`addresses.tsx`** — `radioOuter` + `radioInner` → `Radius.pill` ✅
- [x] **`orders.web.tsx`** — `statusDot` 10×10 → `Radius.pill` ✅

### ✅ Safe Area в `_login.styles.ts` — закрыто
- [x] **`app/(auth)/_login.styles.ts`** — `paddingTop: 60` и `paddingBottom: 60` заменены на `useSafeAreaInsets()` в `login.tsx` ✅

### ✅ Отступы — закрыто
- [x] **Добавлены токены `Spacing.sm = 12` и `Spacing.ml = 20`** в `constants/theme.ts` ✅
- [x] **20+ файлов** — все вхождения `12` и `20` как spacing-значений заменены на `Spacing.sm` / `Spacing.ml` ✅
- [x] **`profile/index.tsx`** — точные совпадения `24→Spacing.l`, `40→Spacing.xxl`, `16→Spacing.m`, `8→Spacing.s` заменены ✅
- [x] **Оставлены как дизайн-константы** — `18`, `30`, `36`, `6` (встречаются 1–2 раза, нет смысла в токене)

