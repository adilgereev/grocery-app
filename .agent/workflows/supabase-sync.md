---
description: Pull current Supabase DB structure, apply local migrations, and update TypeScript types.
---
# Supabase Sync Workflow

This workflow ensures your local development state is in sync with the current Supabase database.

// turbo
1. **Check current status**:
   ```powershell
   npx supabase status
   ```

// turbo
2. **Pull structural changes** (only if modified via Dashboard UI):
   ```powershell
   npm run supabase:pull
   ```

// turbo
3. **Apply local migrations to the cloud**:
   ```powershell
   npm run supabase:push
   ```

// turbo
4. **Update TypeScript types**:
   ```powershell
   npm run supabase:types
   ```

// turbo
5. **Verify schema update**:
   ```powershell
   npx supabase migration list
   ```
