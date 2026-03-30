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

## 🛡️ Best Practices
- **Atomic Migrations**: Keep each migration focused on a single logical change.
- **Local Testing**: Verify migrations locally using Docker (`npx supabase start`) before pushing.
- **Git Hygiene**: Always commit migration files.
