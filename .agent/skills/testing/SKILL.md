---
name: testing-pro
description: Expert in Jest testing and React Native Testing Library. Use this skill for writing unit tests for stores, component tests for UI, and executing the AI Regression Cycle. Trigger whenever the user asks for new features, bug fixes, or code verification.
---
# Testing-Pro: Next-Gen AI Quality Assurance

This skill defines the standards for ensuring code stability and reliability through automated testing.

## 🧪 Triggering Guidelines
- **Always use this skill** when starting a new feature or fixing a bug.
- **Proactively suggest** writing a test before implementation (Tests as Contracts).
- **Trigger** during any refactoring to ensure no regressions occur.

## 🏗️ Testing Infrastructure
- **Framework**: Jest + React Native Testing Library.
- **Global Mocks**: All shared mocks are in `jest.setup.js`. DO NOT duplicate common mocks in test files.
- **testID**: Mandatory for all interactive elements to ensure reliable selectors.

## 🔄 AI Regression Cycle (CRITICAL)
Follow this loop for every non-trivial change:
1. **Tests as Contracts**: Read existing tests to understand current behavior.
2. **Implementation**: Modify the code.
3. **Verification**: Run `npm test` immediately.
4. **Self-Correction**: If tests fail, analyze the error and fix either the code or the test/mock.

## 📐 Testable Design
- **Decomposition**: If a component is hard to test (too many providers), decompose it into smaller functional units in `components/`.
- **Store Coverage**: Zustand stores in `store/` must have 100% logic coverage (actions, computed states).
- **UI Interaction**: Use `fireEvent` to simulate real user behavior, not just snapshot renders.

## 🚀 Performance & Coverage
- `npm test` - Standard test run.
- `npm test -- --coverage` - Check for logical gaps in test coverage.
- `expo lint` - Ensure code style consistency.

## 🛡️ Best Practices
- Use `StyleSheet.flatten` to verify computed styles in UI tests.
- Keep tests isolated; reset mocks between test cases.

---

## 📦 Паттерн: Тест Zustand-стора

Пример: `store/__tests__/cartStore.test.ts`

```ts
import { useCartStore } from '../cartStore';
import { Product } from '@/types';

// AsyncStorage мокается глобально в jest.setup.js — не дублировать

const mockProduct: Product = {
  id: 'prod-1',
  name: 'Яблоки',
  price: 100,
  image_url: 'https://example.com/apple.png',
  unit: 'кг',
  category_id: 'cat-1',
  description: 'Вкусные яблоки',
  is_active: true,
  stock: 100,
  tags: [],
  created_at: '',
  calories: null,
  proteins: null,
  fats: null,
  carbohydrates: null,
};

describe('useCartStore', () => {
  beforeEach(() => {
    // Сброс через экшен стора (для сторов с persist-middleware)
    useCartStore.getState().clearCart();
    // Для простых сторов без persist: useAppStore.setState({ isReady: false })
  });

  it('должен начинаться с пустого состояния', () => {
    const state = useCartStore.getState();
    expect(state.items).toEqual([]);
    expect(state.totalPrice).toBe(0);
  });

  it('добавление товара пересчитывает computed state', () => {
    useCartStore.getState().addItem(mockProduct);
    const state = useCartStore.getState();

    expect(state.items[0].quantity).toBe(1);
    expect(state.totalPrice).toBe(190); // 100 + 90 ₽ доставка
    expect(state.totalItems).toBe(1);
  });

  it('бесплатная доставка от 700 ₽', () => {
    useCartStore.getState().addItem(mockProduct);
    useCartStore.getState().updateQuantity(mockProduct.id, 7);
    const state = useCartStore.getState();

    expect(state.subtotal).toBe(700);
    expect(state.deliveryFee).toBe(0);
  });
});
```

**Правила:**
- Доступ к стейту — только через `.getState()`, не через хуки.
- `beforeEach` — всегда сбрасывать стейт.
- Тестировать computed state (производные значения), а не только raw data.

---

## 🕸️ Паттерн: Мок Supabase

Глобальный мок `createSupabaseMock()` уже настроен в `jest.setup.js` — не дублировать в тест-файлах.

По умолчанию `.single()` и `.maybeSingle()` возвращают `{ data: null, error: null }`.

**Переопределить ответ для конкретного теста:**

```ts
import { supabase } from '@/lib/services/supabase';

it('обрабатывает ошибку загрузки профиля', async () => {
  (supabase.from as jest.Mock).mockReturnValueOnce({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValueOnce({
      data: null,
      error: { message: 'Not found' },
    }),
  });

  // ... вызов кода, который обращается к supabase
});
```

**Структура ответа цепочки:**
```
supabase.from('table').select('*').eq('id', x).single()
  → Promise<{ data: T | null, error: PostgrestError | null }>
```

---

## 🖱️ Паттерн: UI-тест с fireEvent + мок стора

Пример: `components/__tests__/ProductCard.test.tsx`

```tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProductCard from '@/components/product/ProductCard';
import { useCartStore } from '@/store/cartStore';

// Мокаем стор целиком — только нужные поля
jest.mock('@/store/cartStore', () => ({
  useCartStore: jest.fn(),
}));

const mockProduct = { id: 'p1', name: 'Бананы', price: 150, unit: 'кг', /* ... */ };

describe('ProductCard', () => {
  const mockAddItem = jest.fn();
  const mockUpdateQuantity = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Хелпер имитирует selector-вызов: useCartStore(selector => selector(state))
  const mockStore = (items: { product: typeof mockProduct; quantity: number }[]) => {
    const state = { items, addItem: mockAddItem, updateQuantity: mockUpdateQuantity };
    (useCartStore as unknown as jest.Mock).mockImplementation(
      (selector: (s: typeof state) => unknown) => selector(state)
    );
  };

  it('нет в корзине — кнопка "добавить" видна', () => {
    mockStore([]);
    const { getByTestId, queryByTestId } = render(
      <ProductCard item={mockProduct} onPress={jest.fn()} />
    );
    expect(getByTestId('product-add-button')).toBeTruthy();
    expect(queryByTestId('product-increase-button')).toBeNull();
  });

  it('нажатие "добавить" вызывает addItem', () => {
    mockStore([]);
    const { getByTestId } = render(<ProductCard item={mockProduct} onPress={jest.fn()} />);
    fireEvent.press(getByTestId('product-add-button'));
    expect(mockAddItem).toHaveBeenCalledWith(mockProduct);
  });

  it('в корзине — кнопки +/- меняют количество', () => {
    mockStore([{ product: mockProduct, quantity: 3 }]);
    const { getByTestId } = render(<ProductCard item={mockProduct} onPress={jest.fn()} />);
    fireEvent.press(getByTestId('product-increase-button'));
    expect(mockUpdateQuantity).toHaveBeenCalledWith('p1', 4);
  });
});
```

**Правила:**
- `jest.mock()` на уровне модуля — не внутри `describe`.
- `jest.clearAllMocks()` в `beforeEach` — сбрасывает счётчики вызовов.
- `queryByTestId` возвращает `null` если элемента нет — используй для проверки отсутствия.
