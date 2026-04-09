---
name: navigation
description: Expert in Expo Router file-based routing. Use when creating new screens, routes, tabs, or dynamic routes. Trigger on phrases like "добавь экран", "создай страницу", "новый роут", "новая вкладка", "динамический маршрут", "зарегистрируй в стеке".
---
# Navigation: Expo Router File-Based Routing

Этот скилл описывает стандарты создания новых экранов и маршрутов в проекте.

## 🧪 Triggering Guidelines
- **Всегда использовать**, когда нужно создать новый экран, вкладку или динамический маршрут.
- **Проверять регистрацию** в соответствующем `_layout.tsx` при любом новом файле маршрута.
- **Напоминать** об обязательных элементах: `ScreenHeader`, `SafeAreaView`, `testID`.

## 🏗️ Паттерн A: Stack-экран вне табов

Для экранов типа `app/orders.tsx`, `app/product/[id].tsx`, `app/favorites.tsx`.

### 1. Создать файл экрана
```
app/[screen-name].tsx          # простой экран
app/[entity]/[id].tsx          # динамический экран
```

### 2. Зарегистрировать в `app/_layout.tsx`
```tsx
<Stack screenOptions={{ headerShown: false }}>
  <Stack.Screen name="[screen-name]" />
</Stack>
```

### 3. Структура компонента экрана
```tsx
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '@/components/ScreenHeader';

export default function MyScreen() {
  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
      <ScreenHeader title="Заголовок" />
      {/* контент */}
    </SafeAreaView>
  );
}
```

**Правила:**
- `SafeAreaView` с `edges={['bottom']}` — верхний край обрабатывает `ScreenHeader`
- `<ScreenHeader />` обязателен — хардкодить шапки запрещено
- `headerShown: false` в layout, управление шапкой через компонент

---

## 🏗️ Паттерн B: Новая вкладка (Tab)

### 1. Создать структуру
```
app/(tabs)/(новая-вкладка)/
├── _layout.tsx   # <Stack screenOptions={{ headerShown: false }} />
└── index.tsx     # содержимое вкладки
```

### 2. Зарегистрировать в `app/(tabs)/_layout.tsx`
```tsx
<Tabs.Screen
  name="(новая-вкладка)"
  options={{
    title: 'Название',
    tabBarIcon: ({ color }) => <Ionicons name="icon-name" size={26} color={color} />,
    tabBarTestID: 'tab-[name]',
  }}
/>
```

**Правила:**
- Иконки: `IconSymbol` (SF Symbols) для iOS-стиля или `Ionicons` для универсальных
- `testID` / `tabBarTestID` обязателен
- При добавлении вкладки проверить `unstable_settings.initialRouteName` — он должен оставаться `'(index)'`

---

## 🏗️ Паттерн C: Динамический маршрут

```tsx
import { useLocalSearchParams } from 'expo-router';

type Params = { id: string };

export default function EntityScreen() {
  const { id } = useLocalSearchParams<Params>();
  // ...
}
```

**Правила:**
- Типизировать параметры через generics `useLocalSearchParams<Params>()`
- Обрабатывать случай, когда `id` может быть `string | string[]` (Expo Router возвращает массив при повторных сегментах)

---

## 🔀 Навигация из кода

```tsx
import { useRouter } from 'expo-router';

const router = useRouter();

router.push('/orders');              // открыть экран
router.push(`/product/${id}`);       // динамический
router.replace('/(tabs)/(index)');   // без возможности вернуться
router.back();                       // назад
```

---

## ✅ Чеклист нового экрана

- [ ] Файл создан в правильной директории `app/`
- [ ] Экран зарегистрирован в соответствующем `_layout.tsx`
- [ ] `<ScreenHeader />` присутствует (не хардкодить заголовок вручную)
- [ ] `<SafeAreaView edges={['bottom']}>` обёртывает контент
- [ ] `testID` на все интерактивные/навигационные элементы
- [ ] Параметры динамического маршрута типизированы

## 🔗 Связанные файлы
- `app/_layout.tsx` — корневой стек, регистрация stack-экранов
- `app/(tabs)/_layout.tsx` — регистрация вкладок
- `components/ScreenHeader.tsx` — обязательный компонент шапки
