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

describe('base dto', () => {
  test('renders class with ApiProperty', () => {
    const s = renderBaseDto(model, 'User');
    expect(s).toMatch('export class UserDto');
    expect(s).toMatch('ApiProperty');
    expect(s).toMatch('roles: Role[]');
  });
});
