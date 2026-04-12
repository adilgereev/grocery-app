# CLAUDE.md

> [!IMPORTANT]
>
> **Основная конфигурация** — в директории `.agent/rules/`. При начале каждого
> разговора читать ВСЕ файлы там и `.agent/skills/*/SKILL.md`.

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Project

Cross-platform grocery delivery mobile app: **Expo Router + React Native +
Supabase + Zustand**. TypeScript strict mode.

## Commands

```bash
npm install              # Install dependencies
npm run start            # Dev server (expo start)
npm run lint             # ESLint (--max-warnings 0)
npm run type-check       # tsc --noEmit
npm test                 # Jest (jest-expo preset)
npm run test:watch       # Jest --watch
npm run supabase:types   # Regenerate types/supabase.ts
npm run supabase:pull    # Pull remote schema
npm run supabase:push    # Push local migrations
```

**Pre-commit hook** (Husky): `npm run lint && npm run type-check`. Must pass before committing.

**Single test**: `npx jest path/to/test.test.tsx`

## Key Files

| Path                                 | Purpose                                                    |
| ------------------------------------ | ---------------------------------------------------------- |
| `types/index.ts`                     | Core interfaces: `Category`, `Product`, `Order`, `Profile` |
| `types/supabase.ts`                  | Auto-generated DB types — never edit manually              |
| `constants/theme.ts`                 | Design tokens: Colors, Spacing, Radius, FontSize, Shadows  |
| `lib/utils/storageUtils.ts`          | `uploadImage()` — R2 upload via presigned URL              |
| `lib/utils/imageKit.ts`              | `getOptimizedImage()`, `getPlaceholderUrl()` — CDN         |
| `lib/utils/schemas.ts`               | Zod validation schemas for forms (profile, address)        |
| `lib/api/categoriesApi.ts`           | Supabase category hierarchy queries                        |
| `lib/services/supabase.ts`           | Typed Supabase client (cross-platform storage)             |
| `providers/AuthProvider.tsx`         | Auth context — `useAuth()` → `{ session, loading }`        |
| `lib/services/NotificationService.ts` | Push notification registration                            |
| `components/ui/ScreenHeader.tsx`     | Mandatory stack screen header                              |
| `components/product/ProductCard.tsx` | Unified product card component                             |
| `components/ui/Skeleton.tsx`         | Loading placeholder / empty image fallback                 |
| `BACKLOG.md`                         | Project backlog                                            |

## .agent/ Structure

```
.agent/rules/
  architecture.md      — Zustand stores, Supabase, Routing rules, Animations
  code-standards.md    — TS conventions, tokens, testID, Boy Scout Rule, Testing
  dev-workflow.md      — Quality checks, Git rules, Supabase workflow
  project-overview.md  — Tech stack, directories, env vars, all commands, key files
  storage-standards.md — Cloudflare R2 + ImageKit upload/display patterns
  ui-standards.md      — Soft Minimalism, color palette, shadows, cart pattern
.agent/skills/
  supabase/            — Migrations, RLS, type generation
  testing/             — Jest + RNTL, AI Regression Cycle
  navigation/          — Expo Router screens and routes
  skill-creator/       — Creating and improving skills
.agent/workflows/
  verify-task.md       — lint → knip → test → UI audit
  supabase-sync.md     — local ↔ remote DB sync
```

## Взаимодействие

- **Говори прямо**: Если подход пользователя неоптимальный — сказать об этом
  явно, объяснить почему, предложить лучший вариант. Не соглашаться «по
  умолчанию» только потому что так сказали.
- **После каждой задачи**: Предложить одно конкретное улучшение — что можно
  оптимизировать или автоматизировать в том, что только что было сделано.
