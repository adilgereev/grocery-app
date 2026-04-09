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

## 🛠️ Protocols & Workflows
1. **Manual SQL First**: Prefer creating migrations manually: `npx supabase migration new <name>`.
2. **Dashboard Sync**: If changes are made via the Supabase UI, IMMEDIATELY run `npm run supabase:pull` and then `npm run supabase:types`.
3. **Zustand Alignment**: After any schema change, check related stores in `store/` for necessary type updates.

## 🚀 Key Commands
- `npm run supabase:types` - Update `types/supabase.ts` (Never edit manually).
- `npm run supabase:pull` - Sync cloud changes to a local migration file.
- `npm run supabase:push` - Deploy local migrations to the cloud.
- `npx supabase db reset` - Reset local environment and re-apply all migrations.
- `npx supabase start` - Запустить локальное окружение (Docker).
- `npx supabase stop` - Остановить локальное окружение.
- `npx supabase status` - Статус и ключи локального сервера.
- `npx supabase migration list` - Список применённых миграций.

## 🐳 Локальная разработка (Docker)

Для безопасного тестирования без интернета:

1. **Запуск**: `npx supabase start`
2. **Локальный Dashboard**: `http://localhost:54323`
3. **Настройка `.env.local`** для работы приложения с локальной БД:
   ```
   EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<ключ из вывода supabase status>
   ```
4. При `supabase start` / `db reset` — все миграции из `migrations/` применяются автоматически.

## 📋 Сценарии внесения изменений

### Сценарий А: Изменения через Dashboard UI
1. Внести изменения в Supabase Dashboard (таблица, колонка, RLS).
2. `npm run supabase:pull` — CLI создаст SQL-файл в `supabase/migrations/`.
3. `npm run supabase:types` — обновить типы.
4. Закоммитить миграцию в Git.

### Сценарий Б: Ручная миграция (рекомендуется)
1. `npx supabase migration new <name>` — создать заготовку.
2. Написать SQL в созданном файле.
3. `npm run supabase:push` — применить к облаку.
4. `npm run supabase:types` — обновить типы.

## ⛔ Destructive Operations
- **ВСЕГДА спрашивай разрешение пользователя** перед выполнением деструктивных команд: `db reset`, `db drop`, `TRUNCATE`, `DELETE` без `WHERE` и любых других операций, уничтожающих данные.
- Локальная БД может содержать данные, введённые вручную. Reset пересоздаёт БД из миграций и seed.sql, уничтожая всё остальное.

## 🛡️ Best Practices
- **Atomic Migrations**: Keep each migration focused on a single logical change.
- **Local Testing**: Verify migrations locally using Docker (`npx supabase start`) before pushing.
- **Git Hygiene**: Always commit migration files.
