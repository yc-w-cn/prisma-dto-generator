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

  test('应该为没有字段的模型生成空类', () => {
    const emptyModel: ModelDescriptor = {
      name: 'EmptyModel',
      enums: [],
      fields: [],
    };

    const result = renderBaseDto(
      emptyModel,
      'EmptyModel',
      '@/generated/prisma-client',
    );

    // 应该包含类定义
    expect(result).toMatch('export class EmptyModelDto');

    // 应该包含空的类体
    expect(result).toMatch(/export class EmptyModelDto \{[\s\}]*\}/);

    // 空模型不应该包含任何导入
    expect(result).not.toMatch(
      "import { ApiProperty } from '@nestjs/swagger';",
    );
  });

  test('应该正确处理useDateType为false的情况', () => {
    const dateTimeModel: ModelDescriptor = {
      name: 'Post',
      enums: [],
      fields: [
        {
          name: 'createdAt',
          kind: 'scalar',
          type: 'DateTime',
          isList: false,
          isRequired: true,
        },
      ],
    };

    const result = renderBaseDto(
      dateTimeModel,
      'Post',
      '@/generated/prisma-client',
      false,
    );

    // 应该使用IsDateString而不是IsDate
    expect(result).toMatch('IsDateString');

    // 不应该使用Type装饰器
    expect(result).not.toMatch('@Type(() => Date)');

    // 应该使用string类型而不是Date类型
    expect(result).toMatch('createdAt: string');
  });
});
