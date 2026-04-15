---
name: supabase-mastery
description: Expert in Supabase CLI, migrations, and schema management. Use this skill for ANY database changes, SQL migrations, RLS policy updates, or TypeScript type generation. Trigger whenever the user mentions database tables, columns, auth rules, or backend synchronization.
---
# Supabase Mastery: Database Operations

This skill defines the high-standard workflow for managing the Supabase backend in the Grocery App project.

## 🧪 Triggering Guidelines
- **Always use this skill** when modifying the database structure.
- **Trigger** when creating new tables, adding columns, or updating RLS (Row Level Security).
- **Proactively suggest** type generation (`npm run supabase:types`) after any schema change.

## 📁 Source of Truth
- **`supabase/migrations/`**: The ONLY source of truth. Every change must be a timestamped SQL file.
- **NO `schema.sql`**: We do not use a single monolithic schema file. History is managed via migrations.
- **`supabase/seed.sql`**: Use for local testing data (products, categories).

## ⚠️ Главное правило: миграции БД — только пользователь

Claude **никогда** не запускает команды, изменяющие состояние БД: `supabase db push/pull/reset`, `supabase migration new`, `supabase start/stop`. Применение миграций выполняет пользователь вручную.

Вспомогательные команды (`npm run supabase:types`, `npm run lint`, `npm run type-check`) Claude запускает самостоятельно.

## 🛠️ Протокол изменений схемы

**Роль Claude:**
1. Создать SQL-файл миграции в `supabase/migrations/<timestamp>_<name>.sql` с нужным SQL.
2. Проверить связанные Zustand-сторы на необходимость обновления типов.
3. Сообщить пользователю: "Запусти `npm run supabase:push`, затем перезагрузи кеш PostgREST".
4. После подтверждения пользователя — самостоятельно запустить `npm run supabase:types`.
5. Напомнить скопировать: `types/supabase.ts` → `business-admin/src/types/supabase.ts`.

**Роль пользователя (только эти команды):**
1. `npm run supabase:push` — применить миграцию к облаку.
2. При добавлении новых колонок — перезагрузить кеш PostgREST:
   - Supabase Dashboard → SQL Editor → `NOTIFY pgrst, 'reload schema';`
   - Или: Project Settings → API → Reload schema cache.

## 🚀 Команды
- `npm run supabase:types` — обновить `types/supabase.ts` (запускает **Claude** после подтверждения push). После — скопировать в `business-admin/`.
- `npm run supabase:push` — задеплоить миграции в облако (запускает **пользователь**).
- `npm run supabase:pull` — синхронизировать изменения из Dashboard в локальные миграции (запускает **пользователь**).

## 📋 Формат файла миграции

Имя файла: `supabase/migrations/YYYYMMDDHHMMSS_<описание>.sql`

```sql
-- Описание что делает миграция и зачем
ALTER TABLE table_name ADD COLUMN IF NOT EXISTS column_name TYPE;
```

**Правила SQL:**
- Всегда использовать `IF NOT EXISTS` / `IF EXISTS` для безопасных операций.
- Деструктивные операции (DROP, TRUNCATE) — только с явного согласия пользователя.

## ⛔ Destructive Operations
- **ВСЕГДА спрашивай разрешение пользователя** перед выполнением деструктивных команд: `db reset`, `db drop`, `TRUNCATE`, `DELETE` без `WHERE` и любых других операций, уничтожающих данные.
- Локальная БД может содержать данные, введённые вручную. Reset пересоздаёт БД из миграций и seed.sql, уничтожая всё остальное.

## 🛡️ Best Practices
- **Atomic Migrations**: Keep each migration focused on a single logical change.
- **Local Testing**: Verify migrations locally using Docker (`npx supabase start`) before pushing.
- **Git Hygiene**: Always commit migration files.
- **Type Sync**: `types/supabase.ts` и `business-admin/src/types/supabase.ts` — две независимые копии одного файла. После каждого `supabase:types` обязательно копировать в `business-admin/`.
