# Project Overview: Grocery App

## Tech Stack
-   **Framework**: Expo Router (v3+), React Native.
-   **Backend**: Supabase (PostgreSQL, RLS, Auth).
-   **State Management**: Zustand (with selective persistence).
-   **Form Handling**: Native components or standard inputs.
-   **Styling**: Theme-aware styles from `theme.ts`.

## Core Directories
-   `app/`: File-based routes.
    -   `app/(tabs)/`: Main navigation.
    -   `app/(admin)/`: Product management.
    -   `app/(auth)/`: Login and registration.
-   `store/`: Zustand state definitions.
-   `components/`: Reusable UI elements (`ProductCard`, `ScreenHeader`, etc.).
-   `lib/`: Shared utilities like `supabase.ts`.
-   `types/`: TypeScript interfaces/types.
-   `supabase/`: Database migrations and seed data.

## Authentication
`AuthProvider` in `providers/AuthProvider.tsx` wraps the app. Root layout handles redirection:
-   Unauthenticated users -> `/onboarding` or `/login`.
-   Authenticated users -> `/(tabs)/(index)`.

## Environment Variables
-   `EXPO_PUBLIC_SUPABASE_URL`: Supabase API URL.
-   `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Supabase Anonymous Key.
