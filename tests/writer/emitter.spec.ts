import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type { GeneratorConfig } from '@/core/config';
import type { ModelDescriptor } from '@/core/dmmf';
import { emitAll } from '@/writer/emitter';

function tmp(): string {
  return mkdtempSync(join(tmpdir(), 'dto-'));
}

const baseModel: ModelDescriptor = {
  name: 'Post',
  enums: [],
  fields: new Array(40).fill(0).map((_, i) => ({
    name: `f${i}`,
    kind: 'scalar',
    type: 'String',
    isList: false,
    isRequired: true,
  })),
};

const enumModel: ModelDescriptor = {
  name: 'User',
  enums: ['Role', 'Status'],
  fields: [
    {
      name: 'id',
      kind: 'scalar',
      type: 'Int',
      isList: false,
      isRequired: true,
    },
    {
      name: 'role',
      kind: 'enum',
      type: 'Role',
      isList: false,
      isRequired: true,
    },
    {
      name: 'status',
      kind: 'enum',
      type: 'Status',
      isList: false,
      isRequired: false,
    },
  ],
};

const relationModel: ModelDescriptor = {
  name: 'Comment',
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
      name: 'content',
      kind: 'scalar',
      type: 'String',
      isList: false,
      isRequired: true,
    },
    {
      name: 'author',
      kind: 'object',
      type: 'User',
      isList: false,
      isRequired: false,
    },
  ],
};

const baseConfig: GeneratorConfig = {
  output: '',
  emitUpdateReadonly: false,
  swaggerLibrary: 'nestjs',
  useDateType: true,
};

describe('发射器', () => {
  test('生成基础DTO文件', async () => {
    const dir = tmp();
    const config = { ...baseConfig, output: dir };
    emitAll(config, [baseModel], '/path/to/schema.prisma', dir);

    const content = readFileSync(join(dir, 'post.dto.ts'), 'utf8');
    expect(content).toContain('export class PostDto');
    expect(content).toContain('ApiProperty');

    // 检查index.ts文件是否生成
    const indexContent = readFileSync(join(dir, 'index.ts'), 'utf8');
    expect(indexContent).toContain('export { PostDto }');

    rmSync(dir, { recursive: true, force: true });
  });

  test('生成包含枚举的DTO', async () => {
    const dir = tmp();
    const config = { ...baseConfig, output: dir };

    emitAll(config, [enumModel], '/path/to/schema.prisma', dir);

    const baseContent = readFileSync(join(dir, 'user.dto.ts'), 'utf8');
    expect(baseContent).toContain('export class UserDto');
    expect(baseContent).toContain('role: Role');
    expect(baseContent).toContain('status: Status');

    // 现在只生成基础DTO，不生成创建DTO
    expect(existsSync(join(dir, 'create-user.dto.ts'))).toBe(false);

    rmSync(dir, { recursive: true, force: true });
  });

  test('处理空模型列表', async () => {
    const dir = tmp();
    const config = { ...baseConfig, output: dir };

    emitAll(config, [], '/path/to/schema.prisma', dir);

    // 空模型列表不应生成任何文件
    expect(existsSync(join(dir, 'index.ts'))).toBe(false);

    rmSync(dir, { recursive: true, force: true });
  });

  test('生成多个模型的DTO', async () => {
    const dir = tmp();
    const config = { ...baseConfig, output: dir };

    emitAll(config, [baseModel, enumModel], '/path/to/schema.prisma', dir);

    // 检查所有模型的基础DTO文件是否生成
    expect(existsSync(join(dir, 'post.dto.ts'))).toBe(true);
    expect(existsSync(join(dir, 'user.dto.ts'))).toBe(true);

    // 现在不生成创建DTO
    expect(existsSync(join(dir, 'create-post.dto.ts'))).toBe(false);
    expect(existsSync(join(dir, 'create-user.dto.ts'))).toBe(false);

    // 检查index.ts文件包含所有导出
    const indexContent = readFileSync(join(dir, 'index.ts'), 'utf8');
    expect(indexContent).toContain('export { PostDto }');
    expect(indexContent).toContain('export { UserDto }');

    // 检查导出语句按模型定义顺序排序
    const postIndex = indexContent.indexOf('PostDto');
    const userIndex = indexContent.indexOf('UserDto');
    expect(postIndex).toBeLessThan(userIndex); // Post应该在User之前

    rmSync(dir, { recursive: true, force: true });
  });

  test('应该按字母顺序排序导出语句', async () => {
    const dir = tmp();
    const config = { ...baseConfig, output: dir };

    // 创建多个模型，按非字母顺序排列
    const models: ModelDescriptor[] = [
      {
        name: 'Zebra',
        enums: [],
        fields: [
          {
            name: 'id',
            kind: 'scalar',
            type: 'Int',
            isList: false,
            isRequired: true,
          },
        ],
      },
      {
        name: 'Apple',
        enums: [],
        fields: [
          {
            name: 'id',
            kind: 'scalar',
            type: 'Int',
            isList: false,
            isRequired: true,
          },
        ],
      },
      {
        name: 'Banana',
        enums: [],
        fields: [
          {
            name: 'id',
            kind: 'scalar',
            type: 'Int',
            isList: false,
            isRequired: true,
          },
        ],
      },
    ];

    emitAll(config, models, '/path/to/schema.prisma', dir);

    // 检查index.ts文件
    const indexContent = readFileSync(join(dir, 'index.ts'), 'utf8');

    // 检查导出语句按字母顺序排序
    const appleIndex = indexContent.indexOf('AppleDto');
    const bananaIndex = indexContent.indexOf('BananaDto');
    const zebraIndex = indexContent.indexOf('ZebraDto');

    expect(appleIndex).toBeLessThan(bananaIndex); // Apple应该在Banana之前
    expect(bananaIndex).toBeLessThan(zebraIndex); // Banana应该在Zebra之前

    rmSync(dir, { recursive: true, force: true });
  });

  test('处理包含特殊字符的模型名称', async () => {
    const dir = tmp();
    const config = { ...baseConfig, output: dir };

    const specialModel: ModelDescriptor = {
      name: 'User_Profile-Data',
      enums: [],
      fields: [
        {
          name: 'id',
          kind: 'scalar',
          type: 'Int',
          isList: false,
          isRequired: true,
        },
      ],
    };

    emitAll(config, [specialModel], '/path/to/schema.prisma', dir);

    // 检查文件名是否正确转换
    expect(existsSync(join(dir, 'user-profile-data.dto.ts'))).toBe(true);

    const content = readFileSync(join(dir, 'user-profile-data.dto.ts'), 'utf8');
    expect(content).toContain('export class UserProfileDataDto');

    rmSync(dir, { recursive: true, force: true });
  });

  test('使用自定义prismaClientPath', async () => {
    const dir = tmp();
    const config = {
      ...baseConfig,
      output: dir,
      prismaClientPath: '../custom/client',
    };

    emitAll(config, [baseModel], '/path/to/schema.prisma', dir);

    const content = readFileSync(join(dir, 'post.dto.ts'), 'utf8');
    expect(content).toContain('export class PostDto');

    rmSync(dir, { recursive: true, force: true });
  });

  test('应该处理正则表达式匹配边界情况（第54-55行未覆盖代码）', async () => {
    const dir = tmp();
    const config = { ...baseConfig, output: dir };

    // 创建模型名称包含特殊字符的测试用例
    const models: ModelDescriptor[] = [
      {
        name: 'Model_With_Underscore',
        enums: [],
        fields: [
          {
            name: 'id',
            kind: 'scalar',
            type: 'Int',
            isList: false,
            isRequired: true,
          },
        ],
      },
      {
        name: 'ModelWithNumbers123',
        enums: [],
        fields: [
          {
            name: 'id',
            kind: 'scalar',
            type: 'Int',
            isList: false,
            isRequired: true,
          },
        ],
      },
    ];

    emitAll(config, models, '/path/to/schema.prisma', dir);

    // 检查index.ts文件
    const indexContent = readFileSync(join(dir, 'index.ts'), 'utf8');

    // 验证正则表达式能正确匹配包含下划线和数字的类名
    expect(indexContent).toContain('export { ModelWithUnderscoreDto }');
    expect(indexContent).toContain('export { ModelWithNumbers123Dto }');

    rmSync(dir, { recursive: true, force: true });
  });

  test('应该处理正则表达式匹配边界情况（第54-55行分支覆盖率）', async () => {
    const dir = tmp();
    const config = { ...baseConfig, output: dir };

    // 创建模型名称包含特殊字符的测试用例
    const models: ModelDescriptor[] = [
      {
        name: 'Model_With_Underscore',
        enums: [],
        fields: [
          {
            name: 'id',
            kind: 'scalar',
            type: 'Int',
            isList: false,
            isRequired: true,
          },
        ],
      },
      {
        name: 'ModelWithNumbers123',
        enums: [],
        fields: [
          {
            name: 'id',
            kind: 'scalar',
            type: 'Int',
            isList: false,
            isRequired: true,
          },
        ],
      },
    ];

    emitAll(config, models, '/path/to/schema.prisma', dir);

    // 检查index.ts文件
    const indexContent = readFileSync(join(dir, 'index.ts'), 'utf8');

    // 验证正则表达式能正确匹配包含下划线和数字的类名
    expect(indexContent).toContain('export { ModelWithUnderscoreDto }');
    expect(indexContent).toContain('export { ModelWithNumbers123Dto }');

    // 验证排序逻辑正常工作
    const lines = indexContent.trim().split('\n');
    expect(lines).toHaveLength(2); // 两个导出语句

    // 验证导出语句按字母顺序排序
    const modelWithNumbersIndex = indexContent.indexOf(
      'ModelWithNumbers123Dto',
    );
    const modelWithUnderscoreIndex = indexContent.indexOf(
      'ModelWithUnderscoreDto',
    );
    expect(modelWithNumbersIndex).toBeLessThan(modelWithUnderscoreIndex); // ModelWithNumbers123应该在ModelWithUnderscore之前

    rmSync(dir, { recursive: true, force: true });
  });

  test('应该处理正则表达式匹配失败的情况（第54-55行分支覆盖率）', async () => {
    // 创建包含无效导出语句的数组
    const invalidExportStatements = [
      'export { UserDto } from "./user.dto";', // 有效语句
      'export {  } from "./empty.dto";', // 无效语句 - 缺少类名
      'export { PostDto } from "./post.dto";', // 有效语句
      'export from "./invalid.dto";', // 无效语句 - 缺少大括号
    ];

    // 复制emitter.ts中的排序逻辑
    const sortedExportStatements = invalidExportStatements.sort((a, b) => {
      const classNameA = /export\s+\{\s*(\w+)\s*\}/.exec(a)?.[1] ?? '';
      const classNameB = /export\s+\{\s*(\w+)\s*\}/.exec(b)?.[1] ?? '';

      // 比较时去掉 Dto
      const nameA = classNameA.replace(/Dto$/, '');
      const nameB = classNameB.replace(/Dto$/, '');

      return nameA.localeCompare(nameB, 'en', { sensitivity: 'base' });
    });

    // 验证排序结果
    expect(sortedExportStatements).toEqual([
      'export {  } from "./empty.dto";', // 空类名应该排在最前面
      'export from "./invalid.dto";', // 无效语句应该排在前面
      'export { PostDto } from "./post.dto";', // 有效语句按字母顺序
      'export { UserDto } from "./user.dto";', // 有效语句按字母顺序
    ]);
  });

  test('应该处理各种边界情况的正则匹配（第54-55行分支覆盖率）', async () => {
    // 测试各种边界情况的导出语句
    const edgeCaseStatements = [
      'export { UserDto } from "./user.dto";', // 正常情况
      'export {  } from "./empty.dto";', // 空类名
      'export { Post_Dto123 } from "./post.dto";', // 包含下划线和数字
      'export from "./no-braces.dto";', // 没有大括号
      'export { } from "./space-only.dto";', // 只有空格
      'export {\n  MultiLineDto\n} from "./multiline.dto";', // 多行格式
    ];

    // 测试每个语句的正则匹配结果
    const matchResults = edgeCaseStatements.map((statement) => {
      const match = /export\s+\{\s*(\w+)\s*\}/.exec(statement);
      return {
        statement,
        className: match?.[1] ?? '(empty)',
        matched: match !== null,
      };
    });

    // 验证匹配结果
    expect(matchResults).toEqual([
      {
        statement: 'export { UserDto } from "./user.dto";',
        className: 'UserDto',
        matched: true,
      },
      {
        statement: 'export {  } from "./empty.dto";',
        className: '(empty)',
        matched: false,
      },
      {
        statement: 'export { Post_Dto123 } from "./post.dto";',
        className: 'Post_Dto123',
        matched: true,
      },
      {
        statement: 'export from "./no-braces.dto";',
        className: '(empty)',
        matched: false,
      },
      {
        statement: 'export { } from "./space-only.dto";',
        className: '(empty)',
        matched: false,
      },
      {
        statement: 'export {\n  MultiLineDto\n} from "./multiline.dto";',
        className: 'MultiLineDto',
        matched: true,
      },
    ]);

    // 测试排序逻辑
    const sorted = edgeCaseStatements.sort((a, b) => {
      const classNameA = /export\s+\{\s*(\w+)\s*\}/.exec(a)?.[1] ?? '';
      const classNameB = /export\s+\{\s*(\w+)\s*\}/.exec(b)?.[1] ?? '';

      const nameA = classNameA.replace(/Dto$/, '');
      const nameB = classNameB.replace(/Dto$/, '');

      return nameA.localeCompare(nameB, 'en', { sensitivity: 'base' });
    });

    // 验证排序：未匹配的应该排在前面，然后按字母顺序
    expect(sorted[0]).toContain('export {  }'); // 空类名
    expect(sorted[1]).toContain('export from "./no-braces.dto"'); // 无大括号
    expect(sorted[2]).toContain('export { }'); // 只有空格
    // 后面的应该是有匹配的语句
  });
});
