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

## 🎨 Аудит UI / Soft Minimalism

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

## 🧩 Аудит Обязательных Компонентов

### 🟠 ScreenHeader — отсутствует на 11 экранах
- [ ] **`app/setup-profile.tsx`** — кастомная шапка с LinearGradient → заменить на `<ScreenHeader />`
- [ ] **`app/search.tsx`** — самописная навигационная панель → заменить на `<ScreenHeader />`
- [ ] **`app/category/[id].tsx`** — кастомный header с back button → заменить на `<ScreenHeader />`
- [ ] **`app/product/[id].tsx`** — back button внутри `ProductHeader` → заменить на `<ScreenHeader />`
- [ ] **`app/order/[id].tsx`** — кастомный header → заменить на `<ScreenHeader />`
- [ ] **`app/(admin)/`** — все 6 файлов без `<ScreenHeader />` → добавить

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
