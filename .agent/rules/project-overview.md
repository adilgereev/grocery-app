---
trigger: always_on
---

# Project Overview: Grocery App

## Tech Stack

- **Framework**: Expo Router (v3+), React Native.
- **Backend**: Supabase (PostgreSQL, RLS, Auth).
- **State Management**: Zustand (with selective persistence).
- **Form Handling**: `react-hook-form` + `zodResolver` (zod schemas in `lib/utils/schemas.ts`).
- **Styling**: Theme-aware styles from `theme.ts`.

## Core Directories

- `app/`: File-based routes.
  - `app/(tabs)/`: Main navigation.
  - `app/(admin)/`: Product management.
  - `app/(auth)/`: Login and registration.
- `store/`: Zustand state definitions.
- `components/`: Reusable UI elements (`ProductCard`, `ScreenHeader`, etc.).
- `lib/`: Shared utilities like `supabase.ts`.
- `types/`: TypeScript interfaces/types.
- `supabase/`: Database migrations and seed data.
- `business-admin/`: Отдельное Vite/React веб-приложение (веб-админка). Содержит собственный `package.json`, `src/`. После `supabase:types` обязательно копировать `types/supabase.ts` → `business-admin/src/types/supabase.ts`.

## Authentication

`AuthProvider` in `providers/AuthProvider.tsx` wraps the app. Root layout handles redirection:

- Unauthenticated users -> `/onboarding` or `/login`.
- Authenticated users -> `/(tabs)/(index)`.

## File Upload Flow

1. Call edge function `get-upload-url` → receive presigned URL
2. Direct upload to Cloudflare R2
3. Display via ImageKit CDN (`lib/utils/imageKit.ts`)

Helpers: `uploadImage()` in `lib/utils/storageUtils.ts`, `getOptimizedImage()` / `getPlaceholderUrl()` in `lib/utils/imageKit.ts`.

## Critical Constraints

- **Edge Functions** run on Deno, not Node.js — imports via URL only.
- **File size limit**: max 200 lines (`npm run check:file-length`).
- **Lint**: zero warnings — any warning = build failure.
- **`business-admin/`** — separate `node_modules`, runs independently.
- **TypeScript strict mode** enabled.

## Environment Variables

- `EXPO_PUBLIC_SUPABASE_URL`: Supabase API URL.
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Supabase Anonymous Key.

## Skills & Workflows (`.agent/`)

Дополнительные протоколы для специализированных задач:

- **`.agent/skills/supabase/SKILL.md`** — миграции, RLS, типы БД. Подробности в `architecture.md`.
- **`.agent/skills/testing/SKILL.md`** — тестирование и AI Regression Cycle. Подробности в `code-standards.md`.
- **`.agent/skills/navigation/SKILL.md`** — создание экранов, вкладок и динамических маршрутов в Expo Router.
- **`.agent/skills/skill-creator/SKILL.md`** — создание и улучшение новых навыков.
- **`.agent/workflows/verify-task.md`** — автоматическая проверка задач (lint + knip + test).
- **`.agent/workflows/supabase-sync.md`** — синхронизация local ↔ remote БД.

## Commands

```bash
npm install              # Install dependencies
npm run start            # Dev server (expo start)
npm run android          # Android emulator
npm run ios              # iOS simulator
npm run web              # Web browser
npm run lint             # ESLint (--max-warnings 0, fails on any warning)
npm run type-check       # tsc --noEmit
npm test                 # Jest (preset: jest-expo)
npm run test:watch       # Jest --watch
npm run check:file-length  # Check no file exceeds 200 lines
npm run knip             # Find unused exports, files, and dependencies
npm run supabase:types   # Regenerate Supabase types -> types/supabase.ts
npm run supabase:link    # Link to remote Supabase project
npm run supabase:pull    # Pull remote schema into migrations
npm run supabase:push    # Push local migrations to remote
```

**Run single test**: `npx jest path/to/test.test.tsx`

## Key Files

| Path                                   | Purpose                                                                  |
| -------------------------------------- | ------------------------------------------------------------------------ |
| `types/index.ts`                       | Core interfaces: `Category`, `Product`, `Order`, `Profile`, etc.         |
| `types/supabase.ts`                    | Auto-generated DB types (via `npm run supabase:types`)                   |
| `constants/theme.ts`                   | Design tokens: Colors, Spacing, Radius, FontSize, Shadows, Duration      |
| `lib/utils/schemas.ts`                 | Zod validation schemas for forms                                         |
| `lib/utils/storageUtils.ts`            | `uploadImage()` — upload via presigned URL to R2                         |
| `lib/utils/imageKit.ts`                | `getOptimizedImage()`, `getPlaceholderUrl()` — CDN transforms            |
| `lib/api/categoriesApi.ts`             | Supabase queries for category hierarchy                                  |
| `lib/services/supabase.ts`             | Typed Supabase client with cross-platform storage                        |
| `lib/services/NotificationService.ts`  | Push notification registration                                           |
| `providers/AuthProvider.tsx`           | Auth context + phone sync                                                |
| `components/ui/ScreenHeader.tsx`       | Mandatory screen header component                                        |
| `components/product/ProductCard.tsx`   | Unified product card                                                     |
| `components/ui/Skeleton.tsx`           | Loading placeholder / missing image fallback                             |
| `BACKLOG.md`                           | Project backlog                                                          |
| `business-admin/src/types/supabase.ts` | Копия DB-типов для web-админки — синхронизировать после `supabase:types` |
