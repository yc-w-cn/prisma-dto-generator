import type { ModelDescriptor } from '@/core/dmmf';
import { renderBaseDto } from '@/generate/templates/base-dto';

const model: ModelDescriptor = {
  name: 'User',
  enums: [],
  fields: [
    {
      name: 'id',
      kind: 'scalar',
      type: 'Int',
      isList: false,
      isRequired: true,
    },
    {
      name: 'email',
      kind: 'scalar',
      type: 'String',
      isList: false,
      isRequired: true,
    },
    {
      name: 'roles',
      kind: 'enum',
      type: 'Role',
      isList: true,
      isRequired: true,
    },
  ],
};

describe('基础DTO', () => {
  test('渲染包含ApiProperty的类', () => {
    const result = renderBaseDto(model, 'User', '@/generated/prisma-client');
    expect(result).toMatch('export class UserDto');
    expect(result).toMatch('ApiProperty');
    expect(result).toMatch('roles: Role[]');
  });
});
