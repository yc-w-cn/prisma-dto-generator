import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

export function ensureDir(path: string) {
  mkdirSync(path, { recursive: true });
}

export function writeTextFile(filePath: string, content: string) {
  ensureDir(dirname(filePath));
  writeFileSync(filePath, content, 'utf8');
}

export function splitByLines(content: string, maxLines: number): string[] {
  const lines = content.split('\n');
  if (lines.length <= maxLines) return [content];
  const chunks: string[] = [];
  for (let i = 0; i < lines.length; i += maxLines) {
    chunks.push(lines.slice(i, i + maxLines).join('\n'));
  }
  return chunks;
}
