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

Протокол ролей и команды — см. `.agent/rules/dev-workflow.md` (секция 3).

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

## 🎭 Определение роли пользователя в триггерах

Никогда не хардкодить `'admin'` как fallback без проверки ролей персонала. Стандартный CASE для любого триггера, которому нужна роль:

```sql
CASE
  WHEN auth.uid() IS NULL       THEN 'system'
  WHEN NEW.user_id = auth.uid() THEN 'customer'
  WHEN (SELECT is_picker  FROM public.profiles WHERE id = auth.uid()) THEN 'picker'
  WHEN (SELECT is_courier FROM public.profiles WHERE id = auth.uid()) THEN 'courier'
  ELSE 'admin'
END
```

**Почему:** Все RPC сборщика и курьера обновляют таблицу `orders` напрямую — триггер срабатывает с `auth.uid()` персонала, и без этих проверок роль теряется. Применено в `log_order_status_change()` (миграция `20260426000003`).
