#!/usr/bin/env node

const { execSync } = require('child_process');

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => (raw += chunk));
process.stdin.on('end', () => {
  const input = JSON.parse(raw);
  const filePath =
    (input.tool_input && input.tool_input.file_path) ||
    (input.tool_response && input.tool_response.filePath) ||
    '';

  if (!filePath.match(/\.(ts|tsx)$/)) return;

  try {
    const out = execSync(`npx eslint --max-warnings 0 "${filePath}" 2>&1`, {
      encoding: 'utf8',
    });
    if (out) process.stdout.write(out.split('\n').slice(0, 30).join('\n'));
  } catch (err) {
    // ESLint выходит с кодом 1 при ошибках — выводим но не блокируем
    const out = err.stdout || '';
    if (out) process.stdout.write(out.split('\n').slice(0, 30).join('\n'));
  }
});
