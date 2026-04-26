---
name: design-review
description: Аудит UI-токенов и соответствия Soft Minimalism стандартам. Использовать когда нужно проверить дизайн-консистентность, перед PR с UI-правками, или по запросу "проверь дизайн", "audit UI", "токены", "тени". Углублённая версия UI-части review/SKILL.md.
---

# Design Review: Аудит UI-Токенов

## 🎯 Цель

Найти и исправить нарушения Soft Minimalism стандартов в компонентах. Каждая правка — атомарный коммит.

---

## 🔍 Что проверять

### 🚨 Тени (критично)
- `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius` прямо в стилях → заменить на `...Shadows.sm` / `...Shadows.md` / `...Shadows.lg`
- `elevation: N` где N > 0 без явной причины → убрать или обосновать

```ts
// ❌
shadowColor: '#000',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.1,
shadowRadius: 8,
elevation: 4,

// ✅
...Shadows.md,
elevation: 0,
```

### 🔴 Цвета (критично)
- HEX-код или `rgba()` в StyleSheet → заменить на `Colors.light.*`
- Семантические цвета (`error`, `warning`, `info`, `success`) для декора → заменить на нейтральные
- CTA-цвет (`#059669`) использован не для главного действия → исправить роль

```ts
// ❌ color: '#10B981'
// ✅ color: Colors.light.primary
```

### 📐 Скругления
- `borderRadius: N` числом → заменить на `Radius.*` токен
  - Карточки → `Radius.xxl` (24)
  - Кнопки → `Radius.pill`
  - Изображения → `Radius.xl` (20)
  - Иконки/аватары круглые → `Radius.pill`
- Намеренные исключения (не трогать): 18, 30, 36, 6

### 📏 Отступы
- `padding/margin: N` произвольным числом → заменить на `Spacing.*`
- Намеренные исключения (не трогать): 18, 30, 36, 6

### ⏱️ Duration как размер (критично)
- `height: Duration.default` → `Duration.*` — это миллисекунды, не пиксели → заменить на `Spacing.*`

```ts
// ❌ height: Duration.default  // 300px лишнего пространства
// ✅ height: Spacing.xxl
```

### 💀 Скелетоны
- `borderRadius` скелетона ≠ реальному компоненту → выровнять (токен в токен)
- Хардкодированный `width/height` если реальный компонент использует `useWindowDimensions` → заменить
- `...Shadows.*` скелетона ≠ реальному компоненту → выровнять
- Структура: image → info → action должна совпадать

### 🚫 Пустые состояния
- `return null` при пустых данных → показывать placeholder-текст
- Скрытая секция непонятна пользователю: это загрузка или пустота?

```tsx
// ❌ if (items.length === 0) return null;
// ✅ <Text style={styles.emptyText}>Скоро здесь появятся товары...</Text>
```

### 🛒 Список корзины
- Отдельные карточки с тенями на каждый товар → единая карточка с `itemDivider`
- Кнопка удаления через trash-иконку → удаление через кнопку минус при qty=1 + UndoToast

---

## 📋 Процесс

1. **Читать** целевой компонент / экран полностью
2. **Составить список** нарушений с файлом и строкой
3. **Приоритизировать:** критичные (цвета, тени) → средние (скругления, отступы) → полировка (скелетоны, пустые состояния)
4. **Исправлять** по одному нарушению, коммит сразу после каждого
5. **Стоп:** после 20 правок или если WTF-likelihood >20% — спросить пользователя

---

## 📝 Формат коммита

```
style(design): [экран/компонент] — описание нарушения
```

Примеры:
```
style(design): CartItem — заменить shadowColor на ...Shadows.md
style(design): ProductSkeleton — выровнять borderRadius с ProductCard (Radius.xxl)
style(design): OrdersScreen — убрать return null, добавить empty state
```

---

## 📝 Формат отчёта

```
## Design Review: [компонент/экран]

### 🔴 Критичные (исправлено)
- [файл:строка] shadowColor → ...Shadows.md
- [файл:строка] color: '#10B981' → Colors.light.primary

### 🟡 Средние (исправлено)
- [файл:строка] borderRadius: 24 → Radius.xxl

### 🟢 Полировка (исправлено / предложено)
- [файл] Скелетон не совпадает по структуре — предлагаю [изменение]

### ✅ Соответствует стандартам
- Shadows: все через токены
- Spacing: корректные токены
```

---

## 🔗 Связанные файлы
- `.agent/rules/ui-standards.md` — полная дизайн-система и палитра
- `constants/theme.ts` — все токены: Colors, Radius, Spacing, Shadows, Duration
- `.agent/skills/review/SKILL.md` — общий code review (включает UI-проверки)
