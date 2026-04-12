# Dev Workflow: Quality & Git

## 1. ✅ Quality Checks

- После рефакторинга или правок нескольких файлов — всегда запускать `npx tsc --noEmit`.
- Pre-commit hook (Husky) запускает `npm run lint && npm run type-check` автоматически. Коммит невозможен при ошибках.
- После любого изменения логики — `npm test`. Новые фичи не должны ломать старые.

### Порядок проверки перед коммитом
1. `npm run lint` — ESLint (--max-warnings 0, любое предупреждение = ошибка)
2. `npm run type-check` — TypeScript strict mode
3. `npm test` — полный прогон Jest
4. `/verify-task` — AI Regression Cycle (опционально, для сложных задач)

## 2. 🔀 Git Workflow

- **Никогда не коммитить автоматически.** Ждать подтверждения пользователя после тестирования.
- Исключение: пользователь явно просит сделать коммит (`"закоммить"`, `"push"` и т.п.).
- Ветки: работа ведётся в feature/fix-ветках, не в `main`.

## 3. 🗂️ Supabase Workflow

- Изменения схемы — только через миграции в `supabase/migrations/`.
- После любого изменения схемы: `npm run supabase:types`.
- После `supabase:types` — вручную скопировать `types/supabase.ts` → `business-admin/src/types/supabase.ts`.
- Никогда не редактировать `types/supabase.ts` вручную.
- Подробный протокол: `.agent/workflows/supabase-sync.md` и `.agent/skills/supabase/SKILL.md`.

## 4. 🔗 Связанные навыки и workflows

- **Workflow**: `.agent/workflows/verify-task.md` — автоматическая проверка задачи (lint + knip + test).
- **Workflow**: `.agent/workflows/supabase-sync.md` — синхронизация local ↔ remote БД.
