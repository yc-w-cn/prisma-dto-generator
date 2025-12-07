import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { ensureDir, splitByLines, writeTextFile } from '@/utils/fs';

describe('文件系统工具', () => {
  const tmpDir = tmp();

  function tmp(): string {
    return mkdtempSync(join(tmpdir(), 'fs-test-'));
  }

  afterEach(() => {
    // 清理临时目录
    if (existsSync(tmpDir)) {
      rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  describe('ensureDir 函数', () => {
    test('应该创建不存在的目录', () => {
      const dirPath = join(tmpDir, 'new-directory');
      expect(existsSync(dirPath)).toBe(false);

      ensureDir(dirPath);
      expect(existsSync(dirPath)).toBe(true);
    });

    test('应该创建嵌套目录结构', () => {
      const dirPath = join(tmpDir, 'level1', 'level2', 'level3');
      expect(existsSync(dirPath)).toBe(false);

      ensureDir(dirPath);
      expect(existsSync(dirPath)).toBe(true);
    });

    test('应该处理已存在的目录', () => {
      const dirPath = join(tmpDir, 'existing-directory');
      ensureDir(dirPath);
      expect(existsSync(dirPath)).toBe(true);

      // 再次调用应该不会出错
      ensureDir(dirPath);
      expect(existsSync(dirPath)).toBe(true);
    });
  });

  describe('writeTextFile 函数', () => {
    test('应该写入文本文件到指定路径', () => {
      const filePath = join(tmpDir, 'test-file.txt');
      const content = 'Hello, World!';

      writeTextFile(filePath, content);
      expect(existsSync(filePath)).toBe(true);
      expect(readFileSync(filePath, 'utf8')).toBe(content);
    });

    test('应该自动创建不存在的目录结构', () => {
      const filePath = join(tmpDir, 'nested', 'path', 'test-file.txt');
      const content = 'Nested file content';

      writeTextFile(filePath, content);
      expect(existsSync(filePath)).toBe(true);
      expect(readFileSync(filePath, 'utf8')).toBe(content);
    });

    test('应该覆盖已存在的文件', () => {
      const filePath = join(tmpDir, 'existing-file.txt');
      const initialContent = 'Initial content';
      const newContent = 'New content';

      writeTextFile(filePath, initialContent);
      expect(readFileSync(filePath, 'utf8')).toBe(initialContent);

      writeTextFile(filePath, newContent);
      expect(readFileSync(filePath, 'utf8')).toBe(newContent);
    });

    test('应该处理空内容', () => {
      const filePath = join(tmpDir, 'empty-file.txt');

      writeTextFile(filePath, '');
      expect(existsSync(filePath)).toBe(true);
      expect(readFileSync(filePath, 'utf8')).toBe('');
    });

    test('应该处理长文本内容', () => {
      const filePath = join(tmpDir, 'long-file.txt');
      const longContent =
        'Line ' + Array.from({ length: 1000 }, (_, i) => i + 1).join('\nLine ');

      writeTextFile(filePath, longContent);
      expect(existsSync(filePath)).toBe(true);
      expect(readFileSync(filePath, 'utf8')).toBe(longContent);
    });
  });

  describe('splitByLines 函数', () => {
    test('应该将内容按指定行数分割', () => {
      const content = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5';
      const result = splitByLines(content, 2);

      expect(result).toHaveLength(3);
      expect(result[0]).toBe('Line 1\nLine 2');
      expect(result[1]).toBe('Line 3\nLine 4');
      expect(result[2]).toBe('Line 5');
    });

    test('应该处理内容行数等于最大行数的情况', () => {
      const content = 'Line 1\nLine 2\nLine 3';
      const result = splitByLines(content, 3);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(content);
    });

    test('应该处理内容行数小于最大行数的情况', () => {
      const content = 'Line 1\nLine 2';
      const result = splitByLines(content, 3);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(content);
    });

    test('应该处理空内容', () => {
      const result = splitByLines('', 5);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe('');
    });

    test('应该处理单行长内容', () => {
      const content = 'This is a single line of text without any line breaks';
      const result = splitByLines(content, 2);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(content);
    });

    test('应该处理每行只有换行符的情况', () => {
      const content = '\n\n\n\n';
      const result = splitByLines(content, 2);

      // 注意：split('\n') 会将 '\n\n\n\n' 分割成 ['', '', '', '', '']，长度为 5
      // 所以按 2 行分割会得到 3 个元素
      expect(result).toHaveLength(3);
      expect(result[0]).toBe('\n');
      expect(result[1]).toBe('\n');
      expect(result[2]).toBe('');
    });

    test('应该处理最大行数为1的情况', () => {
      const content = 'Line 1\nLine 2\nLine 3';
      const result = splitByLines(content, 1);

      expect(result).toHaveLength(3);
      expect(result[0]).toBe('Line 1');
      expect(result[1]).toBe('Line 2');
      expect(result[2]).toBe('Line 3');
    });

    test('应该处理内容结尾有换行符的情况', () => {
      const content = 'Line 1\nLine 2\nLine 3\n';
      const result = splitByLines(content, 2);

      expect(result).toHaveLength(2);
      expect(result[0]).toBe('Line 1\nLine 2');
      expect(result[1]).toBe('Line 3\n');
    });
  });
});
