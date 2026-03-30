# UI Standards: Emerald Minimalism

## Core Design Principles
-   **Theme Tokens**: Use `theme.ts` for all styling. No "magic numbers" (hex colors, arbitrary spacing).
-   **Emerald Accents**: Primary color is `#10B981` (Emerald).
-   **Minimalism**: Clean, premium UI with soft shadows and generous border radii.
-   **Shadows**: Subtle (`shadowOpacity: 0.04-0.08`, `shadowRadius: 10-14`).
-   **Typography**: Use system fonts with appropriate weights (400, 500, 700).

## Multiplatform Requirements
-   **Android Support**: Always include `elevation` when using `shadow` for iOS.
-   **Safe Areas**: Use `SafeAreaView` from `react-native-safe-area-context` for screens.
-   **Header Handling**: Use `<ScreenHeader />` component for consistent headers.
-   **Input Density**: Maximize horizontal space for input fields.

## Reusable Components
-   `app/(tabs)/(index)/index.tsx`: Main shop page.
-   `components/ProductCard.tsx`: Reusable product card.
-   `components/ScreenHeader.tsx`: Theme-aware header.
-   `components/ui/Skeleton.tsx`: Unified loading states.

## Layers & Z-Index
-   Combine `zIndex` with `elevation` on Android to ensure visibility.
-   Dropdowns or overlapping elements need higher `zIndex`.
