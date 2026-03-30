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
