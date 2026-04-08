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
   - Manually check that all interactive elements have `testID`.
   - Ensure `ScreenHeader` and `SafeAreaView` are correctly implemented.
   - Confirm colors use the `theme.ts` tokens.
