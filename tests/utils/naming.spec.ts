import { toKebabCase, toPascalCase } from '@/utils/naming';

describe('命名转换工具', () => {
  describe('toKebabCase 函数', () => {
    test('应该将驼峰式命名转换为短横线命名', () => {
      expect(toKebabCase('camelCase')).toBe('camel-case');
      expect(toKebabCase('PascalCase')).toBe('pascal-case');
      expect(toKebabCase('CamelCaseWithNumbers123')).toBe(
        'camel-case-with-numbers123',
      );
    });

    test('应该将下划线命名转换为短横线命名', () => {
      expect(toKebabCase('snake_case')).toBe('snake-case');
      expect(toKebabCase('SNAKE_CASE')).toBe('snake-case');
      expect(toKebabCase('snake_case_with_numbers_123')).toBe(
        'snake-case-with-numbers-123',
      );
    });

    test('应该将空格分隔的命名转换为短横线命名', () => {
      expect(toKebabCase('space separated')).toBe('space-separated');
      expect(toKebabCase('  leading and trailing spaces  ')).toBe(
        'leading-and-trailing-spaces',
      );
    });

    test('应该处理混合命名格式', () => {
      expect(toKebabCase('mixed_Case-with spaces')).toBe(
        'mixed-case-with-spaces',
      );
    });

    test('应该处理单字母输入', () => {
      expect(toKebabCase('A')).toBe('a');
      expect(toKebabCase('a')).toBe('a');
    });

    test('应该处理空字符串输入', () => {
      expect(toKebabCase('')).toBe('');
    });

    test('应该处理纯数字输入', () => {
      expect(toKebabCase('123')).toBe('123');
    });

    test('应该处理包含特殊字符的输入', () => {
      expect(toKebabCase('test@example.com')).toBe('test@example.com');
      expect(toKebabCase('test#123')).toBe('test#123');
    });
  });

  describe('toPascalCase 函数', () => {
    test('应该将短横线命名转换为帕斯卡命名', () => {
      expect(toPascalCase('kebab-case')).toBe('KebabCase');
      expect(toPascalCase('kebab-case-with-numbers-123')).toBe(
        'KebabCaseWithNumbers123',
      );
    });

    test('应该将下划线命名转换为帕斯卡命名', () => {
      expect(toPascalCase('snake_case')).toBe('SnakeCase');
      expect(toPascalCase('SNAKE_CASE')).toBe('SnakeCase');
      expect(toPascalCase('snake_case_with_numbers_123')).toBe(
        'SnakeCaseWithNumbers123',
      );
    });

    test('应该将空格分隔的命名转换为帕斯卡命名', () => {
      expect(toPascalCase('space separated')).toBe('SpaceSeparated');
      expect(toPascalCase('  leading and trailing spaces  ')).toBe(
        'LeadingAndTrailingSpaces',
      );
    });

    test('应该将驼峰式命名转换为帕斯卡命名', () => {
      expect(toPascalCase('camelCase')).toBe('CamelCase');
      expect(toPascalCase('CamelCase')).toBe('CamelCase');
    });

    test('应该处理混合命名格式', () => {
      expect(toPascalCase('mixed-case_with spaces')).toBe(
        'MixedCaseWithSpaces',
      );
    });

    test('应该处理单字母输入', () => {
      expect(toPascalCase('a')).toBe('A');
      expect(toPascalCase('A')).toBe('A');
    });

    test('应该处理空字符串输入', () => {
      expect(toPascalCase('')).toBe('');
    });

    test('应该处理纯数字输入', () => {
      expect(toPascalCase('123')).toBe('123');
    });

    test('应该处理包含特殊字符的输入', () => {
      expect(toPascalCase('test@example.com')).toBe('Test@example.com');
      expect(toPascalCase('test#123')).toBe('Test#123');
    });

    test('应该处理连续分隔符', () => {
      expect(toPascalCase('double--dash')).toBe('DoubleDash');
      expect(toPascalCase('triple___underscore')).toBe('TripleUnderscore');
      expect(toPascalCase('multiple   spaces')).toBe('MultipleSpaces');
    });
  });

  describe('命名转换函数组合', () => {
    test('应该能正确转换并反转', () => {
      const original = 'TestString';
      const kebab = toKebabCase(original);
      const pascal = toPascalCase(kebab);
      expect(pascal).toBe(original);
    });

    test('应该处理复杂转换场景', () => {
      const input = 'This is a COMPLEX_string with-Mixed formats_123';
      const kebab = toKebabCase(input);
      const pascal = toPascalCase(kebab);
      expect(pascal).toBe('ThisIsAComplexStringWithMixedFormats123');
    });
  });
});
