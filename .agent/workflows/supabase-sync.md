---
name: supabase-sync
description: Apply local migrations and update TypeScript types. Local DB only — no remote sync.
---
# Supabase Local Workflow

⚠️ **Только локальная БД. Remote sync не используется.**

⚠️ **Все шаги строго последовательны — каждый зависит от предыдущего.**

1. **Написать миграцию** — Claude создаёт файл `supabase/migrations/<timestamp>_<name>.sql`.

2. **Применить миграцию локально** — ⚠️ **только пользователь вручную**:
   ```bash
   npx supabase migration up
   ```
   > Применяет только новые миграции, данные сохраняются.

   > ⚠️ `supabase db reset` — только в исключительных случаях (сломана БД, нужен чистый старт). Удаляет все данные и пересоздаёт БД из миграций + `seed.sql`.

3. **Обновить TypeScript типы** — после подтверждения шага 2 Claude запускает самостоятельно:
   ```bash
   npm run supabase:types
   ```

4. **Синхронизировать типы с business-admin** — вручную скопировать:
   ```
   types/supabase.ts → business-admin/src/types/supabase.ts
   ```

5. **Перезагрузить кеш PostgREST** (при добавлении новых колонок):
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```
