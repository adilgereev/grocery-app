---
name: supabase-sync
description: Pull current Supabase DB structure, apply local migrations, and update TypeScript types.
---
# Supabase Sync Workflow

⚠️ **Все шаги строго последовательны — каждый зависит от предыдущего.**

This workflow ensures your local development state is in sync with the current Supabase database.

1. **Check current status**:
   ```powershell
   npx supabase status
   ```

2. **Pull structural changes** (only if modified via Dashboard UI):
   ```powershell
   npm run supabase:pull
   ```

3. **Apply local migrations to the cloud** — ⚠️ **только пользователь вручную, не Claude**:
   ```powershell
   npm run supabase:push
   ```

4. **Update TypeScript types** — после подтверждения шага 3:
   ```powershell
   npm run supabase:types
   ```

5. **Verify schema update**:
   ```powershell
   npx supabase migration list
   ```
