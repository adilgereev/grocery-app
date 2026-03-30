---
name: [skill-name]
description: [When to trigger, what it does. Be specific and include examples of user phrases.]
---
# UI Component Skill Template

This skill provides the structure and instructions for specialized UI logic or design systems in the Grocery App.

## 🎨 Styles (Emerald Minimalism)
- **Theme Tokens**: Use `theme.ts` for all styling.
- **Shadows**: Subtle (`shadowOpacity: 0.04-0.08`, `shadowRadius: 10-14`).
- **Radius**: Large border radiuses (`borderRadius: 16-24`).
- **Emerald Accents**: Primary color is `#10B981`.

## 🛠️ Multiplatform Checks
- **Android Support**: Always include `elevation` when using `shadow` for iOS.
- **Safe Areas**: Use `SafeAreaView` from `react-native-safe-area-context` for screens.
- **KeyboardAwareScrollView**: Use for all screens with input fields.
- **TextAlignVertical**: Use `textAlignVertical: 'top'` for multi-line inputs on Android.

## 🏗️ Structure
1. **Interactive Elements**: All buttons, inputs, and cards must have `testID`.
2. **Sub-component Structure**: If a component exceeds 200 lines, decompose it into smaller functional units.
3. **Props Validation**: Use TypeScript interfaces for all props.
4. **Theme Awareness**: Use `useTheme()` or `theme` for colors and spacing.

## 🧪 Testing Protocol
- **Component Tests**: Verify rendering, interactions, and prop validation.
- **snapshot**: Optional for visual regression.
- **testID**: Ensure all critical elements are searchable by `getByTestId`.

## 📂 File Paths
- `components/[name].tsx`: Component logic and UI.
- `components/__tests__/[name].test.tsx`: Test cases.
- `types/[name].ts`: Interface definitions.
