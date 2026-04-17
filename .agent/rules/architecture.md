# Architecture: Core App & Data

## 1. 🏗️ Состояние (Zustand)
- **Хранилище как Источник Правды**: Состояние (корзина, адреса, профиль, категории) хранится в сторах. 
- **Реактивность**: Компоненты подписываются на конкретные поля через селекторы.
- **Типизация**: Строгая типизация (`CategoryState`, `CartState`) обязательна.

## 2. ⚡ Backend (Supabase)
- **PostgreSQL на Максимум**: Использовать фильтрацию, сортировку и агрегацию на стороне БД.
- **RLS (Row Level Security)**: Всегда проверять и настраивать политики доступа при создании новых таблиц. Пользователи могут видеть и менять только свои данные.
- **Supabase CLI**: Любые изменения структуры (таблицы, функции) фиксируются в SQL-миграциях (`supabase/migrations/`).
- **Только локальная БД**: Remote Supabase не используется. Миграции применяются через `supabase migration up` локально. `supabase db reset` — только в исключительных случаях (удаляет все данные).

## 3. 🔑 Database Management
- **Обязательная типизация**: После любого изменения схемы ОБЯЗАТЕЛЬНО обновлять типы командой `npm run supabase:types`.
- **Никаких ручных правок**: Изменения схемы только через миграции.
- **Синхронизация типов с business-admin**: `npm run supabase:types` обновляет только `types/supabase.ts` в корне. После этого **обязательно** скопировать файл в `business-admin/src/types/supabase.ts` — там своя копия, автоматически не обновляется.

## 4. 🔀 Навигация (Expo Router)
- Использовать файловую структуру роутинга.
- Передавать `testID` для всех элементов навигации.
- **Файлы стилей — НЕ в `app/`**: Expo Router интерпретирует все файлы в `app/` как маршруты и выводит предупреждения. Файлы стилей (`*.styles.ts`) размещать рядом с компонентом вне папки `app/` (например, в `components/` или корне фичи).

### Правило размещения экранов по стекам

`router.push('/path')` резолвит маршрут в стеке того файла, где он **живёт**, а не откуда был вызван. Если экраны A и B находятся в разных стеках, `router.back()` из B не вернёт в A — это источник навигационных багов.

**Правила:**
- **Экран открывается из нескольких табов** → размещать на **root-уровне** (`app/`) и регистрировать в `app/_layout.tsx` как `Stack.Screen`. Примеры: `app/addresses.tsx`, `app/manage-address.tsx`, `app/product/[id].tsx`.
- **Экран открывается только из одного таба** → размещать в стеке этого таба. Пример: `app/(tabs)/(profile)/favorites.tsx`.
- **Связанные экраны-цепочки** (например, `addresses → manage-address`) → должны жить в **одном стеке**. Если один экран цепочки перемещается на root-уровень, остальные — тоже.

## 5. 🎞️ Анимации (Reanimated 4)

- **`Layout` устарел** — в `react-native-reanimated` v4 (используется `~4.1.1`) `Layout` deprecated. Заменять на `LinearTransition`:
  ```ts
  // ❌ import { Layout } → deprecated
  // ✅ import { LinearTransition }
  layout={LinearTransition.springify()}
  ```
- Это касается всех `Animated.View`, `Animated.FlatList` и других анимированных компонентов.

## 6. 🔗 Связанные навыки и workflows
- **Skill**: `.agent/skills/supabase/SKILL.md` — детальный протокол работы с миграциями, RLS и типами. Обязателен при любых изменениях схемы БД.
- **Workflow**: `.agent/workflows/supabase-sync.md` — применение миграций локально + обновление типов. ⚠️ Remote sync не используется.

## 7. ⚡ Оптимистичное обновление (Optimistic Update)

Применять для всех toggle-операций и быстрых мутаций, где важен мгновенный отклик UI.

```typescript
// 1. Снимок до изменения
const previous = get().field;
// 2. Оптимистичное обновление UI
set({ field: newValue });
try {
  // 3. API-вызов
  await api.update(newValue);
} catch {
  // 4. Откат к снимку
  set({ field: previous });
  Alert.alert('Ошибка', 'Не удалось сохранить изменение');
}
```

**Правила:**
- Снимок — всегда **до** `set()`, иначе откатить нечем
- Откат — через `set({ field: previous })`, не через инверсию `!newValue` — инверсия ломается при двойном нажатии
- Исключение: сложное составное состояние (порядок N элементов) → rollback через `refetch()`, см. `handleMove` в `hooks/useCategories.ts`
- Feedback обязателен: `Alert.alert` в admin-хуках, `Toast` в клиентской части

**Применено в:** `store/favoriteStore.ts` → `toggleFavorite`, `hooks/useCatalog.ts` → `handleToggleActive`, `hooks/useCategories.ts` → `handleToggleVisibility`

## 8. 🔄 Pull-to-Refresh

```typescript
// Всегда локальный useState — НЕ из Zustand store
const [isRefreshing, setIsRefreshing] = useState(false);

const handleRefresh = useCallback(async () => {
  if (isRefreshing) return; // Guard от двойного refresh
  setIsRefreshing(true);
  try {
    await Promise.all([
      fetchA(true), // true = force refresh, игнорировать кеш
      fetchB(true),
    ]);
  } finally {
    setIsRefreshing(false); // finally — гарантирует сброс при ошибке
  }
}, [isRefreshing, fetchA, fetchB]);
```

**Правила:**
- `isRefreshing` — только локальный `useState`. Store-state обновляется асинхронно → при переключении таба во время refresh FlatList теряет синхронизацию → контент зависает (воспроизведённый баг)
- Несколько независимых запросов — `Promise.all`, не последовательно
- Guard `if (isRefreshing) return` — защита от двойного tap

**Применено в:** `app/(tabs)/(index)/index.tsx` → `handleRefresh`, `hooks/useFavorites.ts` → `onRefresh`, `app/orders.tsx` → `onRefresh`
