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
});
