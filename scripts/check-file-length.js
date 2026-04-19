#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const MAX_LINES = 200;

// Файлы и папки, которые игнорируем
const IGNORE_PATTERNS = [
  'node_modules',
  '.next',
  'dist',
  'build',
  '.expo',
  'supabase/migrations',
  'supabase/seed.sql',
  'app/privacy-policy.tsx',
  'app/public-offer.tsx',
];

function isIgnored(filePath) {
  const normalized = filePath.replace(/\\/g, '/');

  // Исключаем автогенерированные типы Supabase
  if (normalized.endsWith('types/supabase.ts')) return true;
  if (normalized.includes('business-admin') && normalized.endsWith('supabase.ts')) return true;

  // Исключаем папки и файлы из IGNORE_PATTERNS
  return IGNORE_PATTERNS.some(pattern => normalized.includes(pattern));
}

function countLines(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return content.split('\n').length;
}

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!isIgnored(filePath)) {
        walkDir(filePath, callback);
      }
    } else if (
      stat.isFile() &&
      (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) &&
      !isIgnored(filePath)
    ) {
      callback(filePath);
    }
  });
}

const violations = [];

walkDir(process.cwd(), filePath => {
  const lines = countLines(filePath);
  if (lines > MAX_LINES) {
    const relativePath = path.relative(process.cwd(), filePath);
    violations.push({ path: relativePath, lines });
  }
});

if (violations.length > 0) {
  console.error(
    `\n❌ Ошибка: найдены файлы, превышающие лимит ${MAX_LINES} строк:\n`
  );
  violations.forEach(({ path, lines }) => {
    console.error(`  ${path} — ${lines} строк`);
  });
  console.error('\n📝 Добавьте декомпозицию в BACKLOG.md и разбейте файлы на меньшие компоненты.');
  console.error('📚 Правило: code-standards.md § 5\n');
  process.exit(1);
} else {
  console.log(`✅ Проверка длины файлов пройдена (макс: ${MAX_LINES} строк)`);
}
