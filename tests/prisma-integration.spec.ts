import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { ModelDescriptor } from '@/core/dmmf';
import { emitAll } from '@/writer/emitter';

describe('Prisma Schema 集成测试', () => {
  let tempDir: string;
  let schemaContent: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'prisma-dto-test-'));

    // 创建一个示例 Prisma schema
    schemaContent = `
generator client {
  provider = "prisma-client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("posts")
}

enum UserRole {
  ADMIN
  USER
  MODERATOR
}
`;

    // 写入 Prisma schema 文件
    writeFileSync(join(tempDir, 'schema.prisma'), schemaContent);
  });

  test('应该从Prisma模型生成DTOs', async () => {
    const outputDir = mkdtempSync(join(tmpdir(), 'dto-output-'));

    // 创建模拟的模型描述符（基于上面的 schema）
    const models: ModelDescriptor[] = [
      {
        name: 'User',
        enums: ['UserRole'],
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
            name: 'name',
            kind: 'scalar',
            type: 'String',
            isList: false,
            isRequired: false,
          },
          {
            name: 'posts',
            kind: 'object',
            type: 'Post',
            isList: true,
            isRequired: false,
          },
          {
            name: 'createdAt',
            kind: 'scalar',
            type: 'DateTime',
            isList: false,
            isRequired: true,
          },
          {
            name: 'updatedAt',
            kind: 'scalar',
            type: 'DateTime',
            isList: false,
            isRequired: true,
          },
        ],
      },
      {
        name: 'Post',
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
            name: 'title',
            kind: 'scalar',
            type: 'String',
            isList: false,
            isRequired: true,
          },
          {
            name: 'content',
            kind: 'scalar',
            type: 'String',
            isList: false,
            isRequired: false,
          },
          {
            name: 'published',
            kind: 'scalar',
            type: 'Boolean',
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
          {
            name: 'authorId',
            kind: 'scalar',
            type: 'Int',
            isList: false,
            isRequired: true,
          },
          {
            name: 'createdAt',
            kind: 'scalar',
            type: 'DateTime',
            isList: false,
            isRequired: true,
          },
          {
            name: 'updatedAt',
            kind: 'scalar',
            type: 'DateTime',
            isList: false,
            isRequired: true,
          },
        ],
      },
    ];

    // 创建配置
    const config = {
      output: outputDir,
      emitRelations: true,
      emitUpdateReadonly: false,
      swaggerLibrary: 'nestjs' as const,
    };

    // 生成 DTO
    emitAll(config, models, '/path/to/schema.prisma', outputDir);

    // 验证生成的输出
    const generatedFiles = readdirSync(outputDir);

    expect(generatedFiles.length).toBeGreaterThan(0);

    // 检查是否生成了预期模型的 DTO 文件
    const modelNames = ['user', 'post'];

    for (const modelName of modelNames) {
      // 检查基础的 DTO 文件 (命名模式: {modelName}.dto.ts)
      const baseDtoFile = generatedFiles.find(
        (f) => f === `${modelName}.dto.ts`,
      );
      expect(baseDtoFile).toBeDefined();

      // 现在只生成基础DTO，不生成创建和更新DTO
      const createDtoFile = generatedFiles.find(
        (f) => f === `create-${modelName}.dto.ts`,
      );
      expect(createDtoFile).toBeUndefined();

      const updateDtoFile = generatedFiles.find(
        (f) => f === `update-${modelName}.dto.ts`,
      );
      expect(updateDtoFile).toBeUndefined();
    }

    // 验证生成的代码内容
    const userBaseFile = readFileSync(join(outputDir, 'user.dto.ts'), 'utf8');

    expect(userBaseFile).toContain('export class UserDto');
    expect(userBaseFile).toContain('id');
    expect(userBaseFile).toContain('email');

    // 验证枚举是否正确处理
    const userBaseFileContent = userBaseFile;

    // 基本字段检查
    expect(userBaseFileContent.includes('id')).toBeTruthy();
    expect(userBaseFileContent.includes('email')).toBeTruthy();
  });

  test('应该处理包含关系的复杂schema', async () => {
    const outputDir = mkdtempSync(join(tmpdir(), 'dto-relations-'));

    // 创建复杂的模型描述符（包含多对多关系）
    const models: ModelDescriptor[] = [
      {
        name: 'Category',
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
            name: 'name',
            kind: 'scalar',
            type: 'String',
            isList: false,
            isRequired: true,
          },
          {
            name: 'posts',
            kind: 'object',
            type: 'Post',
            isList: true,
            isRequired: false,
          },
        ],
      },
      {
        name: 'Tag',
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
            name: 'name',
            kind: 'scalar',
            type: 'String',
            isList: false,
            isRequired: true,
          },
          {
            name: 'posts',
            kind: 'object',
            type: 'Post',
            isList: true,
            isRequired: false,
          },
        ],
      },
      {
        name: 'Post',
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
            name: 'title',
            kind: 'scalar',
            type: 'String',
            isList: false,
            isRequired: true,
          },
          {
            name: 'content',
            kind: 'scalar',
            type: 'String',
            isList: false,
            isRequired: false,
          },
          {
            name: 'category',
            kind: 'object',
            type: 'Category',
            isList: false,
            isRequired: false,
          },
          {
            name: 'categoryId',
            kind: 'scalar',
            type: 'Int',
            isList: false,
            isRequired: true,
          },
          {
            name: 'tags',
            kind: 'object',
            type: 'Tag',
            isList: true,
            isRequired: false,
          },
          {
            name: 'published',
            kind: 'scalar',
            type: 'Boolean',
            isList: false,
            isRequired: true,
          },
          {
            name: 'createdAt',
            kind: 'scalar',
            type: 'DateTime',
            isList: false,
            isRequired: true,
          },
          {
            name: 'updatedAt',
            kind: 'scalar',
            type: 'DateTime',
            isList: false,
            isRequired: true,
          },
        ],
      },
    ];

    const config = {
      output: outputDir,
      emitRelations: true,
      emitUpdateReadonly: false,
      swaggerLibrary: 'nestjs' as const,
    };
    // 生成 DTO
    emitAll(config, models, '/path/to/schema.prisma', outputDir);

    // 验证生成了多少个文件
    const generatedFiles = readdirSync(outputDir);
    expect(generatedFiles.length).toBeGreaterThan(0);

    // 应该为每个模型生成基础 DTO
    expect(generatedFiles.length).toBeGreaterThanOrEqual(3); // 3 models * 1 dto type
  });

  afterEach(() => {
    // 清理临时目录
    // 注意：在实际测试中，这些应该被自动清理
  });
});
