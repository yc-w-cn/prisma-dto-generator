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
});
