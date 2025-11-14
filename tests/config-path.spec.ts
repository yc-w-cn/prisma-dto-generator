import { parseConfig } from '@/core/config';

describe('配置路径解析', () => {
  test('应该基于schema文件解析相对输出路径', () => {
    const config = parseConfig(
      { output: '../src/generated/prisma-class' },
      '/path/to/schema.prisma',
    );

    expect(config.output).toBe('/path/src/generated/prisma-class');
  });

  test('应该处理当前目录的相对路径', () => {
    const config = parseConfig(
      { output: './generated/dto' },
      '/path/to/schema.prisma',
    );

    expect(config.output).toBe('/path/to/generated/dto');
  });

  test('应该处理绝对输出路径', () => {
    const config = parseConfig(
      { output: '/absolute/path/to/output' },
      '/path/to/schema.prisma',
    );

    expect(config.output).toBe('/absolute/path/to/output');
  });

  test('当未提供schema路径时应使用默认输出', () => {
    const config = parseConfig({ output: '../src/generated/prisma-class' });

    expect(config.output).toBe('../src/generated/prisma-class');
  });

  test('当未提供输出配置时应使用默认输出', () => {
    const config = parseConfig({}, '/path/to/schema.prisma');

    expect(config.output).toBe('./generated/dto');
  });

  test('应该处理多层上级目录的相对路径', () => {
    const config = parseConfig(
      { output: '../../../src/generated' },
      '/path/to/schema.prisma',
    );

    expect(config.output).toBe('/src/generated');
  });

  test('应该处理复杂的相对路径组合', () => {
    const config = parseConfig(
      { output: '.././../src/./generated/../dto' },
      '/path/to/schema.prisma',
    );

    // Node.js的path.join会规范化路径，所以 '.././../src/./generated/../dto' 会简化为 '/src/dto'
    expect(config.output).toBe('/src/dto');
  });

  test('应该处理Windows风格的路径分隔符', () => {
    const config = parseConfig(
      { output: '..\\src\\generated' },
      'C:\\path\\to\\schema.prisma',
    );

    // Node.js的path.join会自动处理路径分隔符，但不会规范化Windows路径
    expect(config.output).toBe('..\\src\\generated');
  });

  test('应该处理非字符串输出配置', () => {
    const config = parseConfig({ output: 123 }, '/path/to/schema.prisma');

    // 非字符串配置应该使用默认值，但不会相对于schema路径解析
    expect(config.output).toBe('./generated/dto');
  });

  test('应该处理null输出配置', () => {
    const config = parseConfig({ output: null }, '/path/to/schema.prisma');

    expect(config.output).toBe('./generated/dto');
  });

  test('应该处理undefined输出配置', () => {
    const config = parseConfig({ output: undefined }, '/path/to/schema.prisma');

    expect(config.output).toBe('./generated/dto');
  });

  test('应该处理非字符串输出配置', () => {
    const config = parseConfig({ output: 123 }, '/path/to/schema.prisma');

    expect(config.output).toBe('./generated/dto');
  });
});
