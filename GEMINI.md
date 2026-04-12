# 🌌 Antigravity Project Config (GEMINI.md)

> **Основная конфигурация** — в `.agent/rules/`. При начале каждого разговора
> читать ВСЕ файлы там и `.agent/skills/*/SKILL.md`.
> **Хуки автоматизации** настроены в `.antigravity/settings.json` и `.claude/settings.json`.

## 🇷🇺 Language & Communication

- **Russian Only**: Писать все комментарии к коду исключительно на **русском языке**.
- **Concise Responses**: Отвечать кратко и по существу.

## 🛠️ TypeScript & Code Standards

- **Strict Typing**: Никогда не использовать `any`. Всегда описывать интерфейсы или типы.
- **Return Types**: Всегда указывать типы возвращаемых значений для функций и хуков.
- **No Raw Colors**: Только `Colors.light.*` токены из `constants/theme.ts`. Hex/rgba в компонентах запрещены.
- **No Magic Numbers**: `Spacing.*`, `Radius.*`, `FontSize.*`, `...Shadows.sm/md/lg`.
- **`useCallback`**: Обязателен внутри `useEffect` и для функций, передаваемых в дочерние компоненты.
- **`testID`**: Обязателен на всех интерактивных элементах. Паттерн: `{экран}-{элемент}-{модификатор}`.
- **Boy Scout Rule**: Оставлять код чуть чище — удалять неиспользуемые импорты, исправлять мелкие ошибки типизации рядом.

## 🎨 UI: Soft Minimalism

- **Тени**: `...Shadows.sm/md/lg` (нейтрально-серые). `elevation: 0` на Android.
- **Скругление**: Карточки — `Radius.xxl (24)`, кнопки/инпуты — `Radius.pill (999)`, изображения — `Radius.xl (20)`.
- **Фон**: Экраны — `#F9FAFB`, карточки — `#ffffff`.

## 🎨 Монохромная палитра

- `primaryLight` `#F0FDF4` — фон выделенных/выбранных элементов
- `primary` `#10B981` — бренд, навигация, иконки, выделение
- `cta` `#059669` — **ТОЛЬКО** кнопки главного действия («В корзину», «Оформить заказ»)
- `ctaDark` `#047857` — pressed-состояние CTA
- `error`/`warning`/`success`/`info` — только для статусов, не для декора
- Правило 60-30-10: 60% нейтраль, 30% primary, 10% CTA

## 🗄️ Backend & Storage

- **БД**: Supabase (PostgreSQL + RLS + Auth). RLS обязателен для новых таблиц.
- **Типы**: `npm run supabase:types` после изменения схемы. Не редактировать `types/supabase.ts` вручную.
- **business-admin sync**: после `supabase:types` скопировать `types/supabase.ts` → `business-admin/src/types/supabase.ts`.
- **Хранилище**: Cloudflare R2 + ImageKit CDN. Supabase Storage не использовать.

## 🔀 Навигация (Expo Router)

- **Stack-экраны**: `headerShown: false` в layout + обязательный `<ScreenHeader />` внутри экрана.
- **SafeAreaView**: `edges={['bottom']}` для stack-экранов.
- **Стили**: `*.styles.ts` — **не** в папке `app/` (Expo Router интерпретирует всё там как маршрут).

## 🤖 AI Collaboration Strategy

- **Smart Decomposition**: Если файл превышает **200 строк** — предлагать декомпозицию.
- **No Placeholders**: Никогда не оставлять `// TODO` или пустые реализации.
- **Tests as Contracts**: Перед изменением логики — анализировать существующие тесты.
- **AI Regression**: Если тест падает — исправлять самостоятельно до презентации пользователю.

## 💬 Взаимодействие

- **Говори прямо**: Если подход неоптимальный — сказать явно, объяснить почему, предложить лучший вариант. Не соглашаться «по умолчанию».
- **После каждой задачи**: Предложить одно конкретное улучшение — что можно оптимизировать или автоматизировать.

## ⚡ Commands

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

**Pre-commit hook** (Husky): `npm run lint && npm run type-check`.

**Single test**: `npx jest path/to/test.test.tsx`

## 📁 Project Structure

```
.agent/rules/
  architecture.md      — Zustand stores, Supabase, Routing rules, Animations
  code-standards.md    — TS conventions, tokens, testID, Boy Scout Rule, Testing
  dev-workflow.md      — Quality checks, Git rules, Supabase workflow
  project-overview.md  — Tech stack, directories, env vars, commands, key files
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

## 🗂️ Key Files

| Path | Purpose |
|---|---|
| `types/index.ts` | Core interfaces: `Category`, `Product`, `Order`, `Profile` |
| `types/supabase.ts` | Auto-generated DB types — never edit manually |
| `constants/theme.ts` | Design tokens: Colors, Spacing, Radius, FontSize, Shadows |
| `lib/utils/storageUtils.ts` | `uploadImage()` — R2 upload via presigned URL |
| `lib/utils/imageKit.ts` | `getOptimizedImage()`, `getPlaceholderUrl()` — CDN |
| `lib/utils/schemas.ts` | Zod validation schemas for forms (profile, address) |
| `lib/api/categoriesApi.ts` | Supabase category hierarchy queries |
| `lib/services/supabase.ts` | Typed Supabase client (cross-platform storage) |
| `lib/services/NotificationService.ts` | Push notification registration |
| `providers/AuthProvider.tsx` | Auth context — `useAuth()` → `{ session, loading }` |
| `components/ui/ScreenHeader.tsx` | Mandatory stack screen header |
| `components/product/ProductCard.tsx` | Unified product card component |
| `components/ui/Skeleton.tsx` | Loading placeholder / empty image fallback |
| `BACKLOG.md` | Project backlog |
