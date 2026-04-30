#!/usr/bin/env node

// Хук дизайн-ревью: проверяет UI-файлы на нарушения токенов после каждого Edit/Write

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => (raw += chunk));
process.stdin.on('end', () => {
  const input = JSON.parse(raw);
  const filePath =
    (input.tool_input && input.tool_input.file_path) ||
    (input.tool_response && input.tool_response.filePath) ||
    '';

  // Только .tsx/.ts файлы в components/ или app/
  if (!filePath.match(/\.(tsx|ts)$/)) return;
  const normalized = filePath.replace(/\\/g, '/');
  if (!normalized.includes('/components/') && !normalized.includes('/app/')) return;

  const fs = require('fs');
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch {
    return;
  }

  const violations = [];
  content.split('\n').forEach((line, i) => {
    const trimmed = line.trimStart();
    // Пропустить строки-комментарии
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;

    const n = i + 1;

    if (/'#[0-9a-fA-F]{3,8}'/.test(line) || /"#[0-9a-fA-F]{3,8}"/.test(line)) {
      violations.push(`  [${n}] HEX-цвет → заменить на Colors.light.*`);
    }
    if (/rgba\(/.test(line)) {
      violations.push(`  [${n}] rgba() напрямую → заменить на Colors.light.*`);
    }
    if (/shadowColor\s*:/.test(line) && !line.includes('Shadows.')) {
      violations.push(`  [${n}] shadowColor напрямую → заменить на ...Shadows.*`);
    }
  });

  if (violations.length > 0) {
    const fileName = filePath.split(/[\\/]/).pop();
    process.stdout.write(
      `⚠️  Design tokens: нарушения в ${fileName}:\n${violations.join('\n')}\n`
    );
  }
});
