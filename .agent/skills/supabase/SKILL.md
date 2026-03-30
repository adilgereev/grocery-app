---
name: supabase-mastery
description: Expert in Supabase CLI, migrations, and schema management. Use for any database changes, type generation, or sync tasks.
---
# Supabase Mastery Skill

This skill provides comprehensive instructions for managing the Supabase backend in the Grocery App project.

## Directory Structure
- `supabase/migrations/`: **Single Source of Truth**. Contains timestamped SQL migration files.
- `supabase/seed.sql`: Initial data (products, categories) for testing.
- `supabase/config.toml`: Local Supabase configuration.

## Key CLI Commands (Scripts)
- `npm run supabase:types`: Update TypeScript definitions in `types/supabase.ts`.
- `npm run supabase:pull`: Pull structural changes from the cloud to a new local migration.
- `npm run supabase:push`: Push local migrations to the cloud DB.
- `npm run supabase:status`: Check current DB status.
- `npx supabase migration new <name>`: Create a new migration file.
- `npx supabase db reset`: Reset local DB and re-apply all migrations.

## Integration Protocols
1.  **Dashboard Changes**: If modified via UI, run `pull` and `types` immediately.
2.  **Manual Migrations**: Prefer writing SQL migrations manually in `migrations/`.
3.  **No schema.sql**: Use migrations as the only source of history.
4.  **Zustand Sync**: Ensure stores are updated if the schema changes.

## Best Practices
- Never edit `types/supabase.ts` manually.
- Always commit migration files to Git.
- Use local Docker instance for testing (`npx supabase start`).
