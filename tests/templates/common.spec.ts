import type { FieldDescriptor, ModelDescriptor } from '@/core/dmmf';
import {
  renderImports,
  renderJSDoc,
  renderProp,
} from '@/generate/templates/common';

describe('模板渲染公共函数', () => {
  describe('renderJSDoc 函数', () => {
    test('应该生成基本的JSDoc注释', () => {
      const result = renderJSDoc('TestClass');
      expect(result).toBe('/**\n * TestClass\n */\n');
    });

    test('应该生成带有描述的JSDoc注释', () => {
      const result = renderJSDoc('TestClass', '这是一个测试类');
      expect(result).toBe('/**\n * TestClass\n * 这是一个测试类\n */\n');
    });

    test('应该处理空描述', () => {
      const result = renderJSDoc('TestClass', '');
      expect(result).toBe('/**\n * TestClass\n */\n');
    });

    test('应该处理多行描述', () => {
      const result = renderJSDoc(
        'TestClass',
        '这是第一行\n这是第二行\n这是第三行',
      );
      expect(result).toBe(
        '/**\n * TestClass\n * 这是第一行\n这是第二行\n这是第三行\n */\n',
      );
    });
  });

  describe('renderProp 函数', () => {
    test('应该渲染标量类型属性', () => {
      const field: FieldDescriptor = {
        name: 'id',
        kind: 'scalar',
        type: 'Int',
        isList: false,
        isRequired: true,
        relationName: undefined,
      };

      const result = renderProp(field, false);
      expect(result).toBe(
        `@ApiProperty({ type: Number, format: 'int32' })\n  id: number`,
      );
    });

    test('应该渲染可空标量类型属性', () => {
      const field: FieldDescriptor = {
        name: 'description',
        kind: 'scalar',
        type: 'String',
        isList: false,
        isRequired: false,
        relationName: undefined,
      };

      const result = renderProp(field, false);
      expect(result).toBe(
        `@ApiPropertyOptional({ type: String })\n  description: string | null`,
      );
    });

    test('应该渲染数组类型属性', () => {
      const field: FieldDescriptor = {
        name: 'tags',
        kind: 'scalar',
        type: 'String',
        isList: true,
        isRequired: false,
        relationName: undefined,
      };

      const result = renderProp(field, false);
      expect(result).toBe(
        `@ApiPropertyOptional({ type: [String], isArray: true })\n  tags: string[] | null`,
      );
    });

    test('应该渲染枚举类型属性', () => {
      const field: FieldDescriptor = {
        name: 'status',
        kind: 'enum',
        type: 'PostStatus',
        isList: false,
        isRequired: true,
        relationName: undefined,
      };

      const result = renderProp(field, false);
      expect(result).toBe(
        `@ApiProperty({ type: String })\n  status: PostStatus`,
      );
    });

    test('应该渲染对象类型属性', () => {
      const field: FieldDescriptor = {
        name: 'user',
        kind: 'object',
        type: 'User',
        isList: false,
        isRequired: false,
        relationName: 'UserPosts',
      };

      const result = renderProp(field, false);
      expect(result).toBe(
        `@ApiPropertyOptional({ type: Object })\n  user: unknown | null`,
      );
    });

    test('应该在optionalMode为true时渲染所有属性为可选', () => {
      const field: FieldDescriptor = {
        name: 'id',
        kind: 'scalar',
        type: 'Int',
        isList: false,
        isRequired: true,
        relationName: undefined,
      };

      const result = renderProp(field, true);
      expect(result).toBe(
        `@ApiPropertyOptional({ type: Number, format: 'int32' })\n  id: number`,
      );
    });

    test('应该渲染带有特殊格式的类型', () => {
      const field: FieldDescriptor = {
        name: 'createdAt',
        kind: 'scalar',
        type: 'DateTime',
        isList: false,
        isRequired: true,
        relationName: undefined,
      };

      const result = renderProp(field, false);
      expect(result).toBe(
        `@ApiProperty({ type: Date, format: 'date-time' })\n  createdAt: Date`,
      );
    });
  });

  describe('renderImports 函数', () => {
    test('应该为简单模型生成正确的导入语句', () => {
      const model: ModelDescriptor = {
        name: 'User',
        fields: [
          {
            name: 'id',
            kind: 'scalar',
            type: 'Int',
            isList: false,
            isRequired: true,
            relationName: undefined,
          },
          {
            name: 'name',
            kind: 'scalar',
            type: 'String',
            isList: false,
            isRequired: true,
            relationName: undefined,
          },
        ],
        enums: [],
      };

      const result = renderImports(model, false);
      expect(result).toBe(`import { ApiProperty } from '@nestjs/swagger';\n`);
    });

    test('应该为包含可选字段的模型生成正确的导入语句', () => {
      const model: ModelDescriptor = {
        name: 'User',
        fields: [
          {
            name: 'id',
            kind: 'scalar',
            type: 'Int',
            isList: false,
            isRequired: true,
            relationName: undefined,
          },
          {
            name: 'description',
            kind: 'scalar',
            type: 'String',
            isList: false,
            isRequired: false,
            relationName: undefined,
          },
        ],
        enums: [],
      };

      const result = renderImports(model, false);
      expect(result).toBe(
        `import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';\n`,
      );
    });

    test('应该为包含枚举的模型生成正确的导入语句', () => {
      const model: ModelDescriptor = {
        name: 'User',
        fields: [
          {
            name: 'id',
            kind: 'scalar',
            type: 'Int',
            isList: false,
            isRequired: true,
            relationName: undefined,
          },
          {
            name: 'role',
            kind: 'enum',
            type: 'UserRole',
            isList: false,
            isRequired: true,
            relationName: undefined,
          },
        ],
        enums: ['UserRole'],
      };

      const result = renderImports(model, false);
      expect(result).toBe(
        `import { ApiProperty } from '@nestjs/swagger';\n\nimport { UserRole } from '@/generated/prisma-client/enums';\n`,
      );
    });

    test('应该为包含多个枚举的模型生成正确的导入语句', () => {
      const model: ModelDescriptor = {
        name: 'User',
        fields: [
          {
            name: 'id',
            kind: 'scalar',
            type: 'Int',
            isList: false,
            isRequired: true,
            relationName: undefined,
          },
          {
            name: 'role',
            kind: 'enum',
            type: 'UserRole',
            isList: false,
            isRequired: true,
            relationName: undefined,
          },
          {
            name: 'status',
            kind: 'enum',
            type: 'UserStatus',
            isList: false,
            isRequired: false,
            relationName: undefined,
          },
        ],
        enums: ['UserRole', 'UserStatus'],
      };

      const result = renderImports(model, false);
      expect(result).toBe(
        `import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';\n\nimport { UserRole, UserStatus } from '@/generated/prisma-client/enums';\n`,
      );
    });

    test('应该使用自定义prismaClientPath', () => {
      const model: ModelDescriptor = {
        name: 'User',
        fields: [
          {
            name: 'role',
            kind: 'enum',
            type: 'UserRole',
            isList: false,
            isRequired: true,
            relationName: undefined,
          },
        ],
        enums: ['UserRole'],
      };

      const result = renderImports(model, false, '../custom/client');
      expect(result).toBe(
        `import { ApiProperty } from '@nestjs/swagger';\n\nimport { UserRole } from '../custom/client/enums';\n`,
      );
    });

    test('应该在optionalMode为true时生成正确的导入语句', () => {
      const model: ModelDescriptor = {
        name: 'User',
        fields: [
          {
            name: 'id',
            kind: 'scalar',
            type: 'Int',
            isList: false,
            isRequired: true,
            relationName: undefined,
          },
        ],
        enums: [],
      };

      const result = renderImports(model, true);
      expect(result).toBe(
        `import { ApiPropertyOptional } from '@nestjs/swagger';\n`,
      );
    });

    test('应该在没有使用装饰器时返回空字符串', () => {
      // 这种情况理论上不会发生，因为所有字段都会使用装饰器
      // 但为了测试边界情况，我们创建一个空模型
      const model: ModelDescriptor = {
        name: 'EmptyModel',
        fields: [],
        enums: [],
      };

      const result = renderImports(model, false);
      expect(result).toBe('');
    });
  });
});
