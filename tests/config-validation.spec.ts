import { parseConfig } from '../src/core/config';

describe('配置验证', () => {
  describe('布尔值配置验证', () => {
    test('应该处理 emitUpdateReadonly 配置', () => {
      const config = parseConfig({ emitUpdateReadonly: true });
      expect(config.emitUpdateReadonly).toBe(true);
    });
  });

  describe('字符串配置验证', () => {
    test('应该处理空字符串输出配置', () => {
      const config = parseConfig({ output: '' });
      expect(config.output).toBe('./generated/dto'); // 空字符串应使用默认值
    });

    test('应该处理空白字符串输出配置', () => {
      const config = parseConfig({ output: '   ' });
      expect(config.output).toBe('   '); // 空白字符串应保留原值
    });

    test('应该处理数字输出配置', () => {
      const config = parseConfig({ output: 123 });
      expect(config.output).toBe('./generated/dto'); // 数字应使用默认值
    });

    test('应该处理对象输出配置', () => {
      const config = parseConfig({ output: { path: '/custom/path' } });
      expect(config.output).toBe('./generated/dto'); // 对象应使用默认值
    });

    test('应该处理数组输出配置', () => {
      const config = parseConfig({ output: ['/path1', '/path2'] });
      expect(config.output).toBe('./generated/dto'); // 数组应使用默认值
    });

    test('应该处理 prismaClientPath 配置', () => {
      const config = parseConfig({ prismaClientPath: '../custom/client' });
      expect(config.prismaClientPath).toBe('../custom/client');
    });

    test('应该处理空字符串 prismaClientPath 配置', () => {
      const config = parseConfig({ prismaClientPath: '' });
      expect(config.prismaClientPath).toBeUndefined(); // 空字符串应返回 undefined
    });

    test('应该处理空白字符串 prismaClientPath 配置', () => {
      const config = parseConfig({ prismaClientPath: '   ' });
      expect(config.prismaClientPath).toBe('   '); // 空白字符串应保留原值
    });
  });

  describe('复杂配置验证', () => {
    test('应该处理完整的有效配置', () => {
      const config = parseConfig(
        {
          output: '../generated/dto',
          emitUpdateReadonly: false,
          prismaClientPath: '../prisma-client',
        },
        '/path/to/schema.prisma',
      );

      expect(config.output).toBe('/path/generated/dto'); // 相对路径会基于schema路径解析为绝对路径
      expect(config.emitUpdateReadonly).toBe(false);
      expect(config.prismaClientPath).toBe('../prisma-client');
      expect(config.swaggerLibrary).toBe('nestjs');
    });

    test('应该处理部分配置缺失的情况', () => {
      const config = parseConfig({
        output: './custom/dto',
        // 其他配置使用默认值
      });

      expect(config.output).toBe('./custom/dto');
      expect(config.emitUpdateReadonly).toBe(false);
      expect(config.prismaClientPath).toBeUndefined();
      expect(config.swaggerLibrary).toBe('nestjs');
    });

    test('应该处理完全空配置', () => {
      const config = parseConfig({});

      expect(config.output).toBe('./generated/dto');
      expect(config.emitUpdateReadonly).toBe(false);
      expect(config.prismaClientPath).toBeUndefined();
      expect(config.swaggerLibrary).toBe('nestjs');
    });

    test('应该处理包含无效属性的配置', () => {
      const config = parseConfig({
        output: './dto',
        invalidProperty: 'should be ignored',
        anotherInvalid: 123,
      });

      expect(config.output).toBe('./dto');
      // 无效属性应该被忽略
      expect((config as any).invalidProperty).toBeUndefined();
      expect((config as any).anotherInvalid).toBeUndefined();
    });
  });

  describe('边界情况验证', () => {
    test('应该处理非常长的输出路径', () => {
      const longPath = './' + 'a'.repeat(1000) + '/dto';
      const config = parseConfig({ output: longPath });
      expect(config.output).toBe(longPath);
    });

    test('应该处理特殊字符的输出路径', () => {
      const specialPath = './ge ner@ted/dto';
      const config = parseConfig({ output: specialPath });
      expect(config.output).toBe(specialPath);
    });

    test('应该处理包含Unicode字符的输出路径', () => {
      const unicodePath = './生成/dto';
      const config = parseConfig({ output: unicodePath });
      expect(config.output).toBe(unicodePath);
    });

    test('应该处理包含空格的输出路径', () => {
      const config = parseConfig({ output: './my dto files' });
      expect(config.output).toBe('./my dto files');
    });

    test('应该处理包含点号的输出路径', () => {
      const config = parseConfig({ output: './dto.files/output' });
      expect(config.output).toBe('./dto.files/output');
    });
  });
});
