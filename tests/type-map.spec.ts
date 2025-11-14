import { toSwaggerMeta, toTsType } from '@/core/type-map';

describe('type-map', () => {
  test('scalar to ts type', () => {
    expect(toTsType('String', false)).toBe('string');
    expect(toTsType('Int', true)).toBe('number | null');
    expect(toTsType('BigInt', false)).toBe('string');
  });
  test('swagger meta basics', () => {
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
