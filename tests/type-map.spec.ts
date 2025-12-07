import { toSwaggerMeta, toTsType } from '@/core/type-map';

describe('类型映射', () => {
  describe('toTsType', () => {
    it('应该将标量类型转换为TypeScript类型', () => {
      expect(toTsType('String', false)).toBe('string');
      expect(toTsType('Int', false)).toBe('number');
      expect(toTsType('Float', false)).toBe('number');
      expect(toTsType('Boolean', false)).toBe('boolean');
      expect(toTsType('DateTime', false)).toBe('Date');
      expect(toTsType('DateTime', false, false)).toBe('string');
      expect(toTsType('Json', false)).toBe('Record<string, any>');
      expect(toTsType('Bytes', false)).toBe('string');
      expect(toTsType('BigInt', false)).toBe('string');
      expect(toTsType('Decimal', false)).toBe('number');
    });

    it('应该处理可空类型', () => {
      expect(toTsType('String', true)).toBe('string | null');
      expect(toTsType('Int', true)).toBe('number | null');
      expect(toTsType('Boolean', true)).toBe('boolean | null');
    });

    it('应该处理未知标量类型（第48行default分支）', () => {
      // 测试未知标量类型，应该回退到'any'类型
      // 使用类型断言绕过TypeScript的类型检查来测试default分支
      const invalidScalar = 'InvalidScalar' as any;
      expect(toTsType(invalidScalar, false)).toBe('any');
      expect(toTsType(invalidScalar, true)).toBe('any | null');
    });

    // 测试 useDateType: false 的情况
    test('应该正确处理DateTime类型不使用Date类型的情况', () => {
      expect(toTsType('DateTime', false, false)).toBe('string');
      expect(toTsType('DateTime', true, false)).toBe('string | null');
    });
  });

  describe('Swagger元数据生成', () => {
    // 测试基本类型的Swagger元数据
    test('应该为基本类型生成正确的Swagger元数据', () => {
      // 测试第48行未覆盖的代码
      expect(
        toSwaggerMeta('Json', { isArray: false, nullable: false }),
      ).toEqual({
        typeRef: 'Object',
        format: undefined,
        isArray: false,
        nullable: false,
      });

      // 测试第87-88行未覆盖的代码
      expect(toSwaggerMeta('Json', { isArray: true, nullable: true })).toEqual({
        typeRef: 'Object',
        format: undefined,
        isArray: true,
        nullable: true,
      });
      expect(toSwaggerMeta('Int', { isArray: false, nullable: false })).toEqual(
        {
          typeRef: 'Number',
          format: 'int32',
          isArray: false,
          nullable: false,
        },
      );
      expect(
        toSwaggerMeta('String', { isArray: false, nullable: false }),
      ).toEqual({
        typeRef: 'String',
        format: undefined,
        isArray: false,
        nullable: false,
      });
      expect(
        toSwaggerMeta('Boolean', { isArray: false, nullable: false }),
      ).toEqual({
        typeRef: 'Boolean',
        format: undefined,
        isArray: false,
        nullable: false,
      });
    });

    // 测试 useDateType: false 的情况
    test('应该正确处理DateTime类型不使用Date类型的情况', () => {
      expect(
        toSwaggerMeta('DateTime', {
          isArray: false,
          nullable: false,
          useDateType: false,
        }),
      ).toEqual({
        typeRef: 'String',
        format: 'date-time',
        isArray: false,
        nullable: false,
      });
    });

    // 测试带格式的类型
    test('应该为带格式的类型生成正确的Swagger元数据', () => {
      expect(
        toSwaggerMeta('DateTime', { isArray: false, nullable: false }),
      ).toEqual({
        typeRef: 'Date',
        format: 'date-time',
        isArray: false,
        nullable: false,
      });
      expect(
        toSwaggerMeta('BigInt', { isArray: false, nullable: false }),
      ).toEqual({
        typeRef: 'String',
        format: 'int64',
        isArray: false,
        nullable: false,
      });
      expect(
        toSwaggerMeta('Decimal', { isArray: false, nullable: false }),
      ).toEqual({
        typeRef: 'Number',
        format: 'double',
        isArray: false,
        nullable: false,
      });
      expect(
        toSwaggerMeta('Bytes', { isArray: false, nullable: false }),
      ).toEqual({
        typeRef: 'String',
        format: 'byte',
        isArray: false,
        nullable: false,
      });
    });

    // 测试数组类型
    test('应该为数组类型生成正确的Swagger元数据', () => {
      expect(
        toSwaggerMeta('String', { isArray: true, nullable: false }),
      ).toEqual({
        typeRef: 'String',
        format: undefined,
        isArray: true,
        nullable: false,
      });
      expect(toSwaggerMeta('Int', { isArray: true, nullable: false })).toEqual({
        typeRef: 'Number',
        format: 'int32',
        isArray: true,
        nullable: false,
      });
    });

    // 测试可空类型
    test('应该为可空类型生成正确的Swagger元数据', () => {
      expect(
        toSwaggerMeta('String', { isArray: false, nullable: true }),
      ).toEqual({
        typeRef: 'String',
        format: undefined,
        isArray: false,
        nullable: true,
      });
      expect(toSwaggerMeta('Int', { isArray: true, nullable: true })).toEqual({
        typeRef: 'Number',
        format: 'int32',
        isArray: true,
        nullable: true,
      });
    });

    // 测试组合情况
    test('应该为组合情况生成正确的Swagger元数据', () => {
      expect(
        toSwaggerMeta('DateTime', { isArray: true, nullable: true }),
      ).toEqual({
        typeRef: 'Date',
        format: 'date-time',
        isArray: true,
        nullable: true,
      });
    });
  });
});
