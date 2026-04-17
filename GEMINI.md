# GEMINI.md

> [!IMPORTANT]
>
> **Основная конфигурация** — в директории `.agent/rules/`. При начале каждого
> разговора читать ВСЕ файлы там и `.agent/skills/*/SKILL.md`.
> **Automation hooks** are configured in `.antigravity/settings.json` and `.claude/settings.json`.

This file provides guidance to Antigravity when working with
code in this repository.

## Project

Cross-platform grocery delivery mobile app: **Expo Router + React Native +
Supabase + Zustand**. TypeScript strict mode.

## Commands

→ Полный список в [`.agent/rules/project-overview.md`](.agent/rules/project-overview.md).

## Key Files

→ Полный список в [`.agent/rules/project-overview.md`](.agent/rules/project-overview.md).

## .agent/ Structure

```
.agent/rules/
  architecture.md      — Zustand stores, Supabase, Routing rules, Animations
  code-standards.md    — TS conventions, tokens, testID, Boy Scout Rule, Testing
  dev-workflow.md      — Quality checks, Git rules, Supabase workflow
  project-overview.md  — Tech stack, directories, env vars, all commands, key files
  storage-standards.md — Cloudflare R2 + ImageKit upload/display patterns
  ui-standards.md      — Soft Minimalism, color palette, shadows, cart pattern
.agent/skills/
  supabase/            — Migrations, RLS, type generation
  testing/             — Jest + RNTL, AI Regression Cycle
  navigation/          — Expo Router screens and routes
  skill-creator/       — Creating and improving skills
.agent/workflows/
  verify-task.md       — lint → knip → test → UI audit
  supabase-sync.md     — local ↔ remote DB sync
```

## Communication Style

Respond like a caveman. No articles, no filler words, no pleasantries. Short. Direct. Code speaks for itself.

## Взаимодействие

- **Говори прямо**: Если подход пользователя неоптимальный — сказать об этом
  явно, объяснить почему, предложить лучший вариант. Не соглашаться «по
  умолчанию» только потому что так сказали.
- **После каждой задачи**: Предложить одно конкретное улучшение — что можно
  оптимизировать или автоматизировать в том, что только что было сделано.
