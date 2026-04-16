# 📋 Актуальный Бэклог Grocery App

Этот файл содержит список приоритетных задач для реализации. Разработка ведется
итеративно, согласно принципам «Soft Minimalism».

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

> ✅ Весь блок закрыт и перенесён в [Архив](#-архив--закрытые-задачи).

---

# 💎 БЛОК 3: Развитие

## 💎 Продаваемость и Рекомендации

### Система скидок и промокодов

- [ ] Поле промокода в чеке корзины (валидация через Supabase)
- [ ] Countdown-таймеры на ограниченные акции
- [ ] БД: таблицы discounts, promo_codes, loyalty_levels, promotions

### Умные рекомендации

- [ ] **"Вы смотрели"** — таблица product_views, секция в ProductScreen (3-4
      товара)
- [ ] **Cross-sell "С этим покупают"** — таблица related_products, логика
      комплементарных товаров
- [ ] **На основе истории заказов** — анализ покупок, секция "Рекомендуем для
      вас"
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

## 💎 Раздел "Популярное" на главном экране

- [ ] Аудит и доработка визуала горизонтального скролла популярных товаров:
      скелетон, пустое состояние, анимации
- [ ] Рассмотреть персонализацию: "Вы покупали раньше" vs "Популярное у других"
- [ ] Ограничение количества товаров с кнопкой "Смотреть все" → переход в
      соответствующую категорию или отдельный экран

---

# 🛠️ БЛОК 4: Технический долг и Багфикс

## 🧹 Декомпозиция файлов (аудит от 16.04.2026)

Обнаружены 25 файлов, превышающих лимит в 200 строк (code-standard). Требуется разбить на
меньшие функциональные единицы. Список отсортирован по приоритету (больше всего строк = выше приоритет):

**Admin Panel & Catalog:**

- [x] `components/admin/ProductFormScreen.tsx` — 497 строк → 179 строк (вынесены: useProductForm hook, ProductFormSkeleton, ProductNutrientsSection, ProductImageField, BasicProductFields, стили) ✅
- [x] `app/(admin)/catalog.tsx` — 455 строк → 95 строк (вынесены: useCatalog hook, CatalogProductCard, CatalogSectionHeader, CatalogSkeleton, CatalogSearchBar, buildHierarchy utility) ✅
- [x] `app/(admin)/orders.tsx` — 433 строк ✅
- [x] `app/(admin)/categories.tsx` — 329 строк ✅
- [ ] `components/admin/CategoryFormModal.tsx` — 308 строк
- [ ] `business-admin/src/pages/LoginPage.tsx` — 271 строк
- [ ] `business-admin/src/features/categories/CategoriesTable.tsx` — 236 строк
- [ ] `business-admin/src/features\categories\CategoryFormModal.tsx` — 214 строк
- [ ] `components/admin/CategoryItem.tsx` — 228 строк

**User Screens & Navigation:**

- [ ] `app/(tabs)/(profile)/index.tsx` — 377 строк
- [ ] `app/(tabs)/(index)/category/[id].tsx` — 319 строк
- [ ] `app/(tabs)/(index)/search.tsx` — 322 строк
- [ ] `components/home/StoryViewer.tsx` — 331 строк
- [ ] `app/(tabs)/(profile)/edit-profile.tsx` — 265 строк
- [ ] `app/setup-profile.tsx` — 265 строк
- [ ] `app/(tabs)/(profile)/order/[id].tsx` — 244 строк
- [ ] `app/addresses.tsx` — 250 строк
- [ ] `app/manage-address.tsx` — 242 строк
- [ ] `app/(tabs)/(profile)/favorites.tsx` — 241 строк
- [ ] `app/(admin)/index.tsx` — 238 строк
- [ ] `app/(tabs)/(cart)/index.tsx` — 249 строк

**Components & Utilities:**

- [ ] `components/address/AddressMainSection.tsx` — 217 строк
- [ ] `lib/api/adminApi.ts` — 227 строк
- [ ] `business-admin/src/features/orders/OrdersTable.tsx` — 206 строк

**Автоматическая проверка:**

- Добавлен скрипт `scripts/check-file-length.js` (проверка перед коммитом)
- Интегрирован в pre-commit hook: `npm run check:file-length && npm run lint && npm run type-check`
- Требование: максимум 200 строк на файл (исключение: автогенерированные типы)

---

# ✅ Архив — Закрытые задачи

## 🧩 Аудит Обязательных Компонентов (07.04.2026)

### ScreenHeader — отсутствует на некоторых экранах

- [x] **`app/setup-profile.tsx`** — намеренно без `<ScreenHeader />`: экран
      стиля онбординга (как login), кастомная decorative-шапка
- [x] **`app/product/[id].tsx`** — намеренно без `<ScreenHeader />`:
      overlay-кнопки поверх fullscreen-фото — стандарт для экрана товара (см.
      `ProductHeader`)
- [x] **`app/(admin)/`** — все 6 файлов: нативный Stack-header →
      `<ScreenHeader />` ✅

### ProductCard — самописные карточки

- [x] **`components/home/PopularSection.tsx`** — кастомная карточка товара →
      заменено на `<ProductCard />` ✅
- [x] **`app/(admin)/catalog.tsx`** — `renderProduct` намеренно кастомная:
      admin-строка с кнопками «Изменить/Удалить», не клиентская карточка покупки

## 🧹 Багфикс навигации (11.04.2026)

- [x] **Баг: Навигация из Избранного.** Кнопка «назад» (или свайп) ведет к
      Главному экрану, а не назад в Профиль. — Перемещён `favorites.tsx` в стек
      `(profile)` ✅
- [x] **Баг: Навигация при выборе адреса в корзине.** Тап по адресу -> Кнопка
      «назад» ведет в «Профиль», а не обратно в Корзину. — Перемещены
      `addresses.tsx` и `manage-address.tsx` на root-уровень, зарегистрированы в
      `_layout.tsx` ✅

## 🧹 Багфикс UI и производительности (11.04.2026)

- [x] **Баг: Верстка статусов в деталях заказа.** Статусы «Собираем» и
      «Доставлен» не в полную ширину, последняя буква переносится на новую
      строку. — Увеличена ширина `trackerStep` с 64 до 76px в
      `components/order/OrderTracker.tsx` ✅
- [x] **Баг: Зависание Pull-to-refresh.** Если сделать рефреш на главной и
      успеть переключить таб, контент зависает в промежуточном состоянии. —
      Добавлен локальный `isRefreshing` стейт с `Promise.all` в
      `app/(tabs)/(index)/index.tsx`, исправлена логика `loadPopularProducts` ✅

## 🧹 Аудит Качества Кода (10.04.2026)

### ✅ testID — закрыто

- [x] **`components/admin/AdminCategoryPicker.tsx`** — добавлены
      `category-picker-close`, `category-picker-parent-{id}`,
      `category-picker-child-{id}` ✅
- [x] **`components/address/AddressSearchInput.tsx`** — `testID` уже
      присутствовали на всех элементах ✅
- [x] **`app/(tabs)/(profile)/index.tsx`** — добавлены
      `profile-guest-login-button`, `profile-user-card`,
      `profile-menu-{bonuses/admin/orders/addresses/favorites/support}`,
      `profile-logout-button` ✅
- [x] **`app/(tabs)/(profile)/edit-profile.tsx`** — `profile-firstname-input`,
      `profile-lastname-input`, `profile-save-button` уже присутствовали ✅

### ✅ Архитектура — закрыто

- [x] **`components/home/PopularSection.tsx`** — прямой `router.push` уже был
      заменён на `onProductPress` callback от родителя ✅

### ✅ Актуальность тестов — закрыто

- [x] **`OrderCard.test.tsx`** — `status: 'delivered'` приведён к
      `Enums<'order_status'>` (импорт типа + явное приведение) ✅
- [x] **`CartItem.test.tsx`** и **`ProductCard.test.tsx`** — дублирующий мок
      `useRouter` уже отсутствовал ✅

## 🎨 Аудит UI / Soft Minimalism (обновлён 09.04.2026)

### ✅ Тени — закрыто

- [x] **`shadowColor` унифицирован** — все компоненты используют
      `...Shadows.sm/md/lg` токены. Прямых `shadowColor` в компонентах нет ✅

### ✅ Цветовой баланс (Emerald Overload) — закрыто

- [x] **Строка поиска на главном** — заменен `primaryLight` фон на `borderLight`
      (серый), иконка поиска на `textLight`. ✅
- [x] **Кнопка "В корзину" в ProductCard** — заменен фон `ctaLight` на
      `primaryLight`. Токен `ctaLight` удален из темы. ✅

### ✅ Скругления — закрыто

- [x] **`ProductBottomBar.tsx`** — `addToCartButton` → `Radius.pill` ✅
- [x] **`OrderSection.tsx`** — `sectionCard` → `Radius.xl` ✅
- [x] **`CartItem.tsx`** — `quantityControl` → `Radius.xxl` ✅
- [x] **`ProductBottomBar.tsx`** — `quantityContainer` → `Radius.xxl` ✅
- [x] **`components/cart/CartSummary.styles.ts`** — `addressSelector` +
      `paymentOption borderRadius: 18` → `Radius.xxl` ✅
- [x] **`components/cart/CartSummary.styles.ts`** —
      `checkoutButton borderRadius: 100` → `Radius.pill` ✅
- [x] **`components/order/OrderTracker.tsx`** — `trackerDot` 36×36,
      `borderRadius: 18` → `Radius.pill` ✅
- [x] **`components/product/ProductHeader.tsx`** — `iconButton` 44×44,
      `borderRadius: 22` → `Radius.pill` ✅
- [x] **`app/(admin)/catalog.tsx`** + **`catalog.web.tsx`** —
      `sectionBadge borderRadius: 12` → `Radius.m` ✅
- [x] **`CartSummary.styles.ts`** — `paymentIconContainer` 44×44 → `Radius.pill`
      ✅
- [x] **`ProductBottomBar.tsx`** — `quantityButton` 38×38 → `Radius.pill` ✅
- [x] **`OrderSection.tsx`** — `iconContainer` 40×40 → `Radius.pill` ✅
- [x] **`profile/index.tsx`** — `guestAvatarIcon` 80×80 + `avatar` 56×56 →
      `Radius.pill` ✅
- [x] **`favorites.tsx`** — `emptyIconCircle` 80×80 → `Radius.pill` ✅
- [x] **`EmptyCart.tsx`** — `emptyIconCircle` 80×80 → `Radius.pill` ✅
- [x] **`ErrorBoundary.tsx`** — `iconBackground` 100×100 → `Radius.pill` ✅
- [x] **`FloatingCheckoutButton.tsx`** — `floatingCheckoutButton` →
      `Radius.pill` ✅
- [x] **`CartItem.tsx`** — `circleButton` 28×28 → `Radius.pill`; `itemImage`
      60×60 → `Radius.xxl` ✅
- [x] **`AddressMainSection.tsx`** — `switchBase` + `switchThumb` →
      `Radius.pill` ✅
- [x] **`addresses.tsx`** — `radioOuter` + `radioInner` → `Radius.pill` ✅
- [x] **`orders.web.tsx`** — `statusDot` 10×10 → `Radius.pill` ✅

### ✅ Safe Area в `_login.styles.ts` — закрыто

- [x] **`app/(auth)/_login.styles.ts`** — `paddingTop: 60` и `paddingBottom: 60`
      заменены на `useSafeAreaInsets()` в `login.tsx` ✅

### ✅ Отступы — закрыто

- [x] **Добавлены токены `Spacing.sm = 12` и `Spacing.ml = 20`** в
      `constants/theme.ts` ✅
- [x] **20+ файлов** — все вхождения `12` и `20` как spacing-значений заменены
      на `Spacing.sm` / `Spacing.ml` ✅
- [x] **`profile/index.tsx`** — точные совпадения `24→Spacing.l`,
      `40→Spacing.xxl`, `16→Spacing.m`, `8→Spacing.s` заменены ✅
- [x] **Оставлены как дизайн-константы** — `18`, `30`, `36`, `6` (встречаются
      1–2 раза, нет смысла в токене)

## 🛒 Корзина и UX (14.04.2026)

- [x] **Добавить кнопку очистки всей корзины** — реализовано в `CartScreen` с
      `Alert.alert` подтверждением ✅
- [x] **Добавить вибро-отклик (Haptic Feedback)** — comprehensive implementation:
  - `ProductCard`: `Medium` на добавление, `Light` на ±
  - `CartItem`: `Light` на ± в корзине
  - `ProductBottomBar`: `Medium` на "В корзину", `Light` на ±
  - `CartScreen`: `Medium` на отмену удаления (Undo)
  - `useCheckout`: `Heavy` на успешное оформление заказа
  - `ProductDetailScreen`: `Light` на toggle избранного ✅

## 🧪 Аудит Тестов (10.04.2026)

### ✅ Сторы — закрыто

- [x] **`store/favoriteStore.ts`** — написаны тесты (fetchFavorites,
      toggleFavorite, rollback, clear) ✅
- [x] **`store/appStore.ts`** — написаны базовые тесты инициализации ✅

### ✅ Компоненты — закрыто

- [x] **`components/ui/ScreenHeader.tsx`**, **`ErrorBoundary.tsx`** — написаны
      базовые тесты рендера ✅
- [x] **Компоненты корзины** — `CartSummary`, `CheckoutButton`,
      `PaymentSelector`, `EmptyCart` → написаны тесты ✅
- [x] **Компоненты авторизации** — `PhoneStep`, `OtpStep` → написаны тесты ✅

## 🧹 Багфикс авторизации (14.04.2026)

- [x] **Не очищается код оператора на странице авторизации.** — Реализованы:
      курсор не застревает при удалении скобки, добавлена кнопка очистки поля (крестик),
      синхронизация parent state при каждом изменении (не ждём потери фокуса). ✅

## 👨‍💻 Админ-панель (15.04.2026)

- [x] **Функционал скрытия категорий (visibility toggle)** — реализовано в
      мобильной админ-панели ✅

## 📍 Экран адресов (16.04.2026)

- [x] **Проработка UX/UI экрана «Мои адреса»** — удалён бейдж «Основной» ✅
- [x] **Проработка экрана «Редактирование / Добавление адреса»** — UX формы,
      расположение кнопок, удобство ввода ✅

## 👨‍💻 Синхронизация мобильной и веб-админки (16.04.2026)

- [x] **Toggle `is_active` в каталоге товаров** — кнопка «Скрыть/Показать» в
      карточке товара, оптимистичное обновление + rollback ✅
- [x] **Поиск по каталогу** — строка поиска над списком товаров, клиентская
      фильтрация секций через `useMemo` ✅
- [x] **FK-ошибка при удалении товара** — code 23503 → читаемое сообщение
      «Товар присутствует в заказах» ✅
- [x] **КБЖУ в форме товара** — 4 поля 2×2 (калории, белки, жиры, углеводы),
      сохраняются и загружаются при редактировании ✅
- [x] **Теги в форме товара** — comma-separated ввод → `string[]` при сохранении ✅
- [x] **Остаток — редактируемое поле** — вместо захардкоженного `100` ✅
- [x] **Switch `is_active` в форме товара** — при создании/редактировании ✅
- [x] **Accordion категорий** — chevron ▶/▼ на родительских категориях, LayoutAnimation
      collapse/expand дочерних; `collapsedParents: Set<string>` в `categories.tsx` ✅
- [x] **Иерархия в каталоге товаров** — `FlatList` с типизированными элементами
      `root_header → sub_header → product`; поиск сохраняет заголовки над найденными
      товарами; оптимистичные обновления перестроены на извлечении продуктов из `allItems` ✅
