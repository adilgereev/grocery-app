# CLAUDE.md
> [!IMPORTANT]

> **ВНИМАНИЕ:** Основная конфигурация проекта для ИИ перенесена в директорию `.agent/rules/project-overview.md`.
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Cross-platform grocery delivery mobile app: Expo Router (file-based routing) + React Native + Supabase + Zustand. TypeScript, strict mode.

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
npm run supabase:types   # Regenerate Supabase types -> types/supabase.ts
npm run supabase:link    # Link to remote Supabase project
npm run supabase:pull    # Pull remote schema into migrations
npm run supabase:push    # Push local migrations to remote
```

**Pre-commit hook** (Husky): runs `npm run lint && npm run type-check`. Must pass before committing.

**Run single test**: `npx jest path/to/test.test.tsx`

## Architecture

### Routing (Expo Router)

File-based in `app/`. Route groups use parentheses: `(tabs)`, `(auth)`, `(admin)`.

- `app/_layout.tsx` — Root: wraps in `AuthProvider` + `ErrorBoundary`. Controls auth redirect logic.
- `app/(tabs)/` — Main tab nav (Home, Cart, Profile). `unstable_settings.initialRouteName: '(index)'` ensures Home loads first (alphabetical `(cart)` would win otherwise).
- `app/(auth)/` — Login flow.
- `app/(admin)/` — Admin: catalog CRUD, order management, category management.
- Stack screens outside tabs: `addresses`, `edit-profile`, `category/[id]`, `product/[id]`, `order/[id]`, `favorites`, `orders`, `search`.

### State Management (Zustand)

All stores in `store/`, created with `zustand/create()`. Stores with `persist` middleware use AsyncStorage.

- `appStore` — Onboarding state (`hasSeenOnboarding`, `isReady`).
- `cartStore` — Persisted. Cart items with computed `subtotal`, `deliveryFee` (free above 700₽), `totalPrice`, `totalItems`. Batch add support.
- `categoryStore` — Persisted with 5-min cache. Fetches hierarchy from Supabase, provides `getCategoryById`, `getSubcategories`.
- `favoriteStore` — User favorites synced with Supabase.
- `addressStore` — Delivery addresses.

Components subscribe via selectors (e.g. `useCartStore(state => state.totalItems)`).

### Backend (Supabase)

- Client in `lib/supabase.ts` — typed with `Database` from `types/supabase.ts`. Custom storage adapter handles Web (localStorage) vs Native (AsyncStorage), plus SSR guard.
- Tables: `profiles`, `categories`, `products`, `orders`, `order_items`, `addresses`, `favorites`.
- RLS enabled — users can only access their own data.
- Schema changes via migrations in `supabase/migrations/`. After any schema change, run `npm run supabase:types`.
- Category API extracted to `lib/categoriesApi.ts` for hierarchy queries.

### Auth

`AuthProvider` wraps app. Exposes `useAuth()` → `{ session, loading }`. Phone auto-synced to profile on sign-in. Root layout redirects unauthed users to login/onboarding.

### Forms & Validation

- `react-hook-form` + `zod` + `@hookform/resolvers/zod`.
- Schemas in `lib/schemas.ts` (profile, address).
- `TextInput` with `textAlignVertical: 'top'` for multiline (Android fix).

### Theme System (`constants/theme.ts`)

All styling uses tokens — no raw hex codes or magic numbers in components:
- `Colors.light.*` / `Colors.dark.*` — Full palette (primary: `#10B981` Emerald).
- `Spacing` — `xs(4)`, `s(8)`, `m(16)`, `l(24)`, `xl(32)`, etc.
- `Radius` — `xs(4)` through `xxl(24)`, `pill(999)`.
- `FontSize` — `xs(10)` through `hero(48)`.
- `Fonts` — Platform-adaptive (SF system-ui on iOS, system on Android).

## Code Conventions

- **Comments in Russian** — all code comments must be in Russian.
- **No raw colors** — always use `Colors.light.*` tokens, never hex/rgba in components.
- **`useCallback`** for all functions inside `useEffect` or passed to children.
- **`testID`** on all interactive/navigable elements.
- **Platform shadows** — always duplicate `shadow*` (iOS) with `elevation` (Android).
- **`SafeAreaView`** from `react-native-safe-area-context` for screen edges.
- **`KeyboardAwareScrollView`** with `enableOnAndroid` for forms.
- **`ScreenHeader`** component mandatory for all stack screen headers — no hardcoded headers.
- **Path alias**: `@/*` → project root (configured in tsconfig).
- **Polyfill**: `react-native-url-polyfill/auto` required before Supabase import.

## Key Files

| Path | Purpose |
|---|---|
| `types/index.ts` | Core interfaces: `Category`, `Product`, `Order`, `Profile`, etc. |
| `types/supabase.ts` | Auto-generated DB types (via `npm run supabase:types`) |
| `lib/schemas.ts` | Zod validation schemas for forms |
| `lib/categoriesApi.ts` | Supabase queries for category hierarchy |
| `lib/supabase.ts` | Typed Supabase client with cross-platform storage |
| `lib/NotificationService.ts` | Push notification registration |
| `providers/AuthProvider.tsx` | Auth context + phone sync |
| `components/ScreenHeader.tsx` | Mandatory screen header component |
| `components/ProductCard.tsx` | Unified product card |
| `components/Skeleton.tsx` | Loading placeholder component |
| `BACKLOG.md` | Project backlog |

## Testing

- Jest + `jest-expo` preset + `@testing-library/react-native`.
- Setup in `jest.setup.js`, `@/` path alias mapped via `moduleNameMapper`.
- Tests in `components/__tests__/` — `ProductCard`, `CartItem`, `OrderCard`, `SubcategoryCard`, `AddressSearchInput`.
- Run `npm test` after any logic change — no regressions allowed.