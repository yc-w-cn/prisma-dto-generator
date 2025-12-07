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

      const result = renderProp(field, false, false);
      expect(result).toBe(
        `@ApiPropertyOptional({ type: String })
  @IsOptional()
  description: string | null`,
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

      const result = renderProp(field, false, false);
      expect(result).toBe(
        `@ApiPropertyOptional({ type: [String], isArray: true })
  @IsOptional()
  tags: string[] | null`,
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

      const result = renderProp(field, false, false);
      expect(result).toBe(
        `@ApiPropertyOptional({ type: Object })
  @IsOptional()
  user: unknown | null`,
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

      const result = renderProp(field, true, false);
      expect(result).toBe(
        `@ApiPropertyOptional({ type: Number, format: 'int32' })
  @IsOptional()
  id: number`,
      );
    });

    test('应该渲染带有特殊格式的类型 (useDateType: true)', () => {
      const field: FieldDescriptor = {
        name: 'createdAt',
        kind: 'scalar',
        type: 'DateTime',
        isList: false,
        isRequired: true,
        relationName: undefined,
      };

      const result = renderProp(field, false, true);
      expect(result).toBe(
        `@ApiProperty({ type: Date, format: 'date-time' })
  @Type(() => Date)
  @IsDate()
  createdAt: Date`,
      );
    });

    test('应该渲染带有特殊格式的类型 (useDateType: false)', () => {
      const field: FieldDescriptor = {
        name: 'createdAt',
        kind: 'scalar',
        type: 'DateTime',
        isList: false,
        isRequired: true,
        relationName: undefined,
      };

      const result = renderProp(field, false, false);
      expect(result).toBe(
        `@ApiProperty({ type: String, format: 'date-time' })
  @IsDateString()
  createdAt: string`,
      );
    });

    test('应该正确缩进装饰器（可选字段和日期装饰器前应有2个空格缩进）', () => {
      const field: FieldDescriptor = {
        name: 'createdAt',
        kind: 'scalar',
        type: 'DateTime',
        isList: false,
        isRequired: false,
        relationName: undefined,
      };

      const result = renderProp(field, false, true);

      // 验证装饰器缩进格式
      const lines = result.split('\n');

      // 第一行：@ApiPropertyOptional 装饰器（无缩进）
      expect(lines[0]).toBe(
        `@ApiPropertyOptional({ type: Date, format: 'date-time' })`,
      );

      // 第二行：@IsOptional 装饰器（2个空格缩进）
      expect(lines[1]).toBe(`  @IsOptional()`);

      // 第三行：@Type 装饰器（2个空格缩进）
      expect(lines[2]).toBe(`  @Type(() => Date)`);

      // 第四行：@IsDate 装饰器（2个空格缩进）
      expect(lines[3]).toBe(`  @IsDate()`);

      // 第五行：属性定义（2个空格缩进）
      expect(lines[4]).toBe(`  createdAt: Date | null`);

      // 验证整个字符串格式
      expect(result).toBe(
        `@ApiPropertyOptional({ type: Date, format: 'date-time' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  createdAt: Date | null`,
      );
    });

    test('应该处理对象类型属性（第119行未覆盖代码）', () => {
      const field: FieldDescriptor = {
        name: 'user',
        kind: 'object',
        type: 'User',
        isList: false,
        isRequired: true,
        relationName: 'UserPosts',
      };

      const result = renderProp(field, false, false);
      expect(result).toBe(`@ApiProperty({ type: Object })\n  user: unknown`);
    });

    test('应该处理optionalMode为true时的对象类型属性（第17行未覆盖代码）', () => {
      const field: FieldDescriptor = {
        name: 'user',
        kind: 'object',
        type: 'User',
        isList: false,
        isRequired: true,
        relationName: 'UserPosts',
      };

      const result = renderProp(field, true, false);
      expect(result).toBe(
        `@ApiPropertyOptional({ type: Object })\n  @IsOptional()\n  user: unknown`,
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

    test('应该正确分组第三方包导入（class-validator 和 class-transformer 放在一起）', () => {
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
            name: 'createdAt',
            kind: 'scalar',
            type: 'DateTime',
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

      const result = renderImports(model, false, undefined, true);

      // 验证导入语句结构
      const lines = result.trim().split('\n');

      // 应该包含官方包、第三方包组（没有枚举，所以只有4行）
      expect(lines).toHaveLength(4);

      // 官方包单独一行
      expect(lines[0]).toBe(
        `import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';`,
      );

      // 空行分隔
      expect(lines[1]).toBe('');

      // 第三方包放在一起，用换行符分隔（不需要空行）
      expect(lines[2]).toBe(
        `import { IsDate, IsOptional } from 'class-validator';`,
      );
      expect(lines[3]).toBe(`import { Type } from 'class-transformer';`);

      // 验证整个字符串格式
      expect(result).toBe(
        `import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';\n\nimport { IsDate, IsOptional } from 'class-validator';\nimport { Type } from 'class-transformer';\n`,
      );
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

      const result = renderImports(model, false, undefined, false);
      expect(result).toBe(
        `import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';\n\nimport { IsOptional } from 'class-validator';\n`,
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

    test('应该跳过关联字段（第17行未覆盖代码）', () => {
      const model: ModelDescriptor = {
        name: 'Post',
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
            name: 'title',
            kind: 'scalar',
            type: 'String',
            isList: false,
            isRequired: true,
            relationName: undefined,
          },
          {
            name: 'author',
            kind: 'object',
            type: 'User',
            isList: false,
            isRequired: true,
            relationName: 'PostAuthor',
          },
          {
            name: 'comments',
            kind: 'object',
            type: 'Comment',
            isList: true,
            isRequired: false,
            relationName: 'PostComments',
          },
        ],
        enums: [],
      };

      const result = renderImports(model, false);

      // 关联字段应该被跳过，只生成非关联字段的导入
      expect(result).toBe(`import { ApiProperty } from '@nestjs/swagger';\n`);

      // 验证没有生成关联字段相关的装饰器导入
      expect(result).not.toContain('IsOptional');
      expect(result).not.toContain('ApiPropertyOptional');
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

      const result = renderImports(model, false, undefined, false);
      expect(result).toBe(
        `import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';\n\nimport { IsOptional } from 'class-validator';\n\nimport { UserRole, UserStatus } from '@/generated/prisma-client/enums';\n`,
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

      const result = renderImports(model, true, undefined, false);
      expect(result).toBe(
        `import { ApiPropertyOptional } from '@nestjs/swagger';\n\nimport { IsOptional } from 'class-validator';\n`,
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
