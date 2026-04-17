# Dev Workflow: Quality & Git

## 1. ✅ Quality Checks

- После рефакторинга или правок нескольких файлов — всегда запускать `npx tsc --noEmit`.
- Pre-commit hook (Husky) запускает `npm run lint && npm run type-check` автоматически. Коммит невозможен при ошибках.
- После любого изменения логики — `npm test`. Новые фичи не должны ломать старые.

### Порядок проверки перед коммитом
1. `npm run check:file-length` — Проверка, что файлы не превышают 200 строк (pre-commit hook)
2. `npm run lint` — ESLint (--max-warnings 0, любое предупреждение = ошибка)
3. `npm run type-check` — TypeScript strict mode
4. `npm test` — полный прогон Jest
5. `/verify-task` — AI Regression Cycle (опционально, для сложных задач)

## 2. 🔀 Git Workflow

- **Никогда не коммитить автоматически.** Ждать подтверждения пользователя после тестирования.
- Исключение: пользователь явно просит сделать коммит (`"закоммить"`, `"push"` и т.п.).
- Ветки: работа ведётся в feature/fix-ветках, не в `main`.

## 3. 🗂️ Supabase Workflow

⚠️ **Применение миграций к БД — ТОЛЬКО пользователем вручную.** Claude не запускает команды, изменяющие состояние удалённой или локальной БД.

**Роль Claude:**
1. Написать SQL для миграции и сохранить в `supabase/migrations/<timestamp>_<name>.sql`.
2. Напомнить пользователю выполнить `npm run supabase:push` и при необходимости перезагрузить кеш PostgREST (`NOTIFY pgrst, 'reload schema'`).
3. После подтверждения пользователя — самостоятельно запустить `npm run supabase:types`.
4. Напомнить скопировать `types/supabase.ts` → `business-admin/src/types/supabase.ts`.

**Никогда не запускать самостоятельно**: `supabase db push`, `supabase db pull`, `supabase db reset`, `supabase migration new`, `supabase start/stop`.

- Никогда не редактировать `types/supabase.ts` вручную.
- Подробный протокол: `.agent/skills/supabase/SKILL.md`.

## 4. 🔗 Связанные навыки и workflows

- **Workflow**: `.agent/workflows/verify-task.md` — автоматическая проверка задачи (lint + knip + test).
- **Workflow**: `.agent/workflows/supabase-sync.md` — синхронизация local ↔ remote БД.
