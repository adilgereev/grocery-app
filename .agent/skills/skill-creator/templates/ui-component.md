---
name: [skill-name]
description: [When to trigger, what it does. Be specific and include examples of user phrases.]
---
# UI Component Skill Template

Шаблон для создания UI-компонентов в стиле Soft Minimalism.

## 🎨 Styles (Soft Minimalism)
- **Theme Tokens**: Только `theme.ts`. Никаких hex-кодов и magic numbers в компонентах.
- **Тени**: Нейтральные серые (`shadowColor: Colors.light.text`, `shadowOpacity: 0.03–0.05`, `shadowRadius: 12–16`). Не цветные.
- **Скругление**: Карточки — `Radius.xxl (24)`, кнопки/инпуты — `Radius.pill (999)`. Всегда токены, не числа напрямую.
- **Фон**: Экраны — `Colors.light.background` (`#F9FAFB`), карточки — `Colors.light.card` (`#ffffff`).
- **Типографика**: Акцентный вес — `fontWeight: '700'`. Системные шрифты через токены.

## 🎨 Цветовая палитра (монохромная)
- `primary` `#10B981` — бренд, навигация, иконки, выделение активных элементов
- `cta` `#059669` — ТОЛЬКО кнопки главного действия ("В корзину", "Оформить заказ", FAB)
- `ctaDark` `#047857` — pressed-состояние CTA
- Янтарный/контрастный акцент намеренно не используется
- **Правило 60-30-10**: 60% нейтраль, 30% primary, 10% CTA
- **Один цвет — одна роль**: нельзя использовать один токен в двух разных смысловых контекстах
- **Не более 2 акцентов на экране**: 1 бренд-цвет + 1 CTA
- `error`/`warning`/`success`/`info` — только для статусов, не для декора иконок или плиток

## 🛠️ Multiplatform Checks
- **Android elevation**: `elevation: 0` по умолчанию — глубина только через shadow-свойства iOS.
- **Safe Areas**: `SafeAreaView` из `react-native-safe-area-context` для экранных краёв.
- **KeyboardAwareScrollView**: Для всех экранов с полями ввода (`enableOnAndroid: true`).
- **TextAlignVertical**: `textAlignVertical: 'top'` для многострочных полей (Android).

## 🏗️ Structure
1. **Pill-форма**: Все кнопки действий, инпуты, контролы количества — обязательно `borderRadius: Radius.pill`.
2. **Interactive Elements**: Все кнопки, инпуты и карточки должны иметь `testID`.
3. **Sub-component Structure**: Если компонент превышает 200 строк — декомпозировать на меньшие функциональные единицы.
4. **Props Validation**: TypeScript-интерфейсы для всех props.

## 🧪 Testing Protocol
- **Component Tests**: Проверять рендер, взаимодействия и prop validation.
- **testID**: Все критические элементы должны быть доступны через `getByTestId`.

## 📂 File Paths
- `components/[name].tsx`: Логика и UI компонента.
- `components/__tests__/[name].test.tsx`: Тест-кейсы.
- `types/[name].ts`: Интерфейсы (если нужны отдельные типы).
