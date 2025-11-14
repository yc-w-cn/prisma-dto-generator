import { toSwaggerMeta, toTsType } from '@/core/type-map';

describe('类型映射', () => {
  test('标量类型转TypeScript类型', () => {
    expect(toTsType('String', false)).toBe('string');
    expect(toTsType('Int', true)).toBe('number | null');
    expect(toTsType('BigInt', false)).toBe('string');
  });
  test('Swagger元数据基础', () => {
    expect(toSwaggerMeta('Int', { isArray: false, nullable: false })).toEqual({
      typeRef: 'Number',
      format: 'int32',
      isArray: false,
      nullable: false,
    });
    expect(
      toSwaggerMeta('DateTime', { isArray: true, nullable: true }),
    ).toEqual({
      typeRef: 'String',
      format: 'date-time',
      isArray: true,
      nullable: true,
    });
  });
});
