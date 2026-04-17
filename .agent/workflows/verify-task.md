---
name: verify-task
description: Automated AI regression cycle to verify task completion.
turbo_note: "Шаги с маркером // turbo могут выполняться параллельно между собой. Шаги без маркера — последовательно, зависят от предыдущих."
---
# Verify Task Workflow: Automated Regression Cycle

This workflow ensures your changes follow the project's quality standards.

// turbo
1. **Lint code**:
   ```powershell
   npm run lint
   ```

// turbo
2. **Check for unused code**:
   ```powershell
   npx knip
   ```

// turbo
3. **Run relevant tests**:
   ```powershell
   npm test
   ```

4. **Verify UI Standards**:
   - Все интерактивные элементы имеют `testID` в формате `{экран}-{элемент}-{модификатор}`.
   - Каждый stack-экран использует `<ScreenHeader />` (исключения: `product/[id].tsx`, `setup-profile.tsx`).
   - `<SafeAreaView edges={['bottom']}>` обёртывает контент stack-экранов.
   - Нет прямых HEX/rgba значений в компонентах — только `Colors.light.*`, `Spacing.*`, `Radius.*`.
   - Тени через `...Shadows.sm/md/lg` спред-токены, не прямые `shadowColor`.
   - Кнопки главного действия используют `Colors.light.cta` (#059669), не `primary`.
