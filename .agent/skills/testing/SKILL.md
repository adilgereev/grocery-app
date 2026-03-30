---
name: testing-pro
description: Expert in Jest testing and React Native Testing Library. Use for writing units, component tests, and verifying regressions.
---
# Testing-Pro Skill: Next-Gen AI Workflow

This skill provides the structure and standards for high-quality automated testing in the Grocery App project.

## Standards and Infrastructure
- **Jest & React Native Testing Library**: The core testing suite.
- **jest.setup.js**: Unified location for global mocks (`AsyncStorage`, `Reanimated`, `Expo Router`, `Supabase`).
- **testID**: Required for all interactive elements (buttons, inputs, cards).

## Testable Decomposition
- Move inline list items and complex UI blocks to `components/` before writing tests.
- Prioritize **Unit Tests for Stores** and **Component Tests for UI**.

## UI Test Guidelines
- Verify interaction via `fireEvent.press`, `fireEvent.changeText`.
- Check style properties: `StyleSheet.flatten(element.props.style)`.

## Logic Unit Tests
- Zustand stores must have 100% logic coverage.
- Complex transformation functions (addresses, dates) require `.test.ts`.

## AI Regression Cycle
1.  **Tests as Contracts**: Analyze existing tests before refactoring.
2.  **AI Regression**: After every logic/UI change, run relevant tests (`npm test`).
3.  **Self-Correction**: Iterate until tests pass.
4.  **Test Cleanliness**: Add `testID` and basic interaction tests to all new components.

## Command Reference
- `npm test`: Run all tests.
- `npm test -- --coverage`: Check test coverage.
- `expo lint`: Verify code style.
