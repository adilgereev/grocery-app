---
name: review
description: Code review под стандарты grocery-app. Использовать перед мержем, после крупных правок, или по запросу "проверь код", "review", "посмотри на". Проверяет app-specific правила — токены, testID, useCallback, Zod, ScreenHeader — в отличие от generic code-review плагина.
---

# Review: Code Review под Стандарты Проекта

## ⚙️ Классификация находок

**AUTO-FIX** — исправить немедленно, без вопросов:
- HEX-коды / `rgba()` напрямую в компоненте → `Colors.light.*`
- Отсутствует `useCallback` на функции в `useEffect` или передаваемой в дочерний компонент
- `Layout` из Reanimated → `LinearTransition` (deprecated в v4)
- Неиспользуемые импорты, `console.log` в production-коде
- Комментарий на английском → перевести на русский

**ASK** — сообщить пользователю, ждать подтверждения:
- Компонент >200 строк без декомпозиции
- Отсутствует `testID` на интерактивном элементе
- Ручная валидация строк (`if (str.length !== 11)`) вместо Zod
- `ScreenHeader` отсутствует на stack-экране (проверять по списку исключений ниже)
- `isRefreshing` в Zustand store вместо локального `useState`
- Прямой доступ к `process.env.*` / `import.meta.env.*` минуя `config/env.ts`
- `shadowColor` / `elevation` прямо в компоненте вместо `...Shadows.*`

---

## 📋 Полный чеклист

### Токены и стили
- [ ] Нет HEX-кодов и `rgba()` напрямую (только `Colors.light.*`)
- [ ] Нет `shadowColor` напрямую (только спред `...Shadows.sm/md/lg`)
- [ ] `borderRadius` через `Radius.*` токен (кроме намеренных: 18, 30, 36, 6)
- [ ] `padding/margin` через `Spacing.*` (кроме: 18, 30, 36, 6)
- [ ] `Duration.*` не используется как размер — только для анимаций (мс)

### Логика и хуки
- [ ] Все функции в `useEffect` или в пропсах дочерних компонентов обёрнуты `useCallback`
- [ ] Все переменные в массиве зависимостей (`exhaustive-deps`)
- [ ] `isRefreshing` — локальный `useState`, не в store
- [ ] Оптимистичное обновление: снимок ДО `set()`, откат через снимок (не инверсию)

### Архитектура
- [ ] Компонент ≤200 строк
- [ ] `ScreenHeader` присутствует на stack-экране
  - Исключения без `ScreenHeader`: `app/product/[id].tsx`, `app/setup-profile.tsx` — не исправлять
- [ ] Нет прямых обращений к `process.env.*` / `import.meta.env.*`
- [ ] Валидация форм через Zod + `zodResolver`, не ручные проверки
- [ ] `Layout` (deprecated) заменён на `LinearTransition`

### testID
- [ ] Все кнопки, ссылки, TouchableOpacity имеют `testID`
- [ ] Паттерн: `{экран}-{элемент}-{модификатор}` (напр. `profile-menu-orders`)
- [ ] Динамические элементы: суффикс `-{id}` или `-{index}`

### Чистота
- [ ] Нет неиспользуемых импортов
- [ ] Нет `console.log` в production-коде
- [ ] Комментарии на русском языке

---

## 📝 Формат отчёта

```
## Code Review

### AUTO-FIX (применено)
- [файл:строка] Заменён HEX #10B981 → Colors.light.primary
- [файл:строка] Добавлен useCallback на handleSubmit

### ASK (требует решения)
1. [файл] Компонент 247 строк — предлагаю декомпозировать на [X] и [Y]
2. [файл:строка] Отсутствует testID на кнопке удаления

### ✅ Пройдено
- Все токены корректны
- testID покрыт на всех интерактивных элементах
```

---

## 🔒 Принцип доказательности

Каждая находка подкреплена конкретным файлом и строкой. Без доказательства — не выдвигать.

❌ "Возможно, тут есть проблема с useCallback"
✅ "`components/Cart.tsx:45` — функция `handleRemove` передаётся в `CartItem` без useCallback"

---

## 🔗 Связанные файлы
- `.agent/rules/code-standards.md` — полный кодекс стандартов
- `.agent/rules/ui-standards.md` — токены, тени, скругления
- `.agent/skills/testing/SKILL.md` — запустить `npm test` после AUTO-FIX
- `.agent/skills/design-review/SKILL.md` — углублённый аудит UI-токенов
