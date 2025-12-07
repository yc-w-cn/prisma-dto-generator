# Prisma DTO Generator (Swagger)

[![GitHub Repository](https://img.shields.io/badge/GitHub-@yc--w--cn/prisma--dto--generator-blue.svg)](https://github.com/yc-w-cn/prisma-dto-generator)
[![npm version](https://img.shields.io/npm/v/@yc-w-cn/prisma-dto-generator.svg)](https://www.npmjs.com/package/@yc-w-cn/prisma-dto-generator)
[![npm downloads](https://img.shields.io/npm/dm/@yc-w-cn/prisma-dto-generator.svg)](https://www.npmjs.com/package/@yc-w-cn/prisma-dto-generator)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Author](https://img.shields.io/badge/Author-Wang%20Yuchen-orange.svg)](mailto:contact@wangyuchen.cn)
[![Version](https://img.shields.io/badge/Version-v0.3.1-blue.svg)](CHANGELOG.md)
[![codecov](https://codecov.io/github/yc-w-cn/prisma-dto-generator/graph/badge.svg?token=90F31MACL6)](https://codecov.io/github/yc-w-cn/prisma-dto-generator)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/yc-w-cn/prisma-dto-generator)

[📝 查看更新日志](CHANGELOG.md) • [🐛 报告问题](https://github.com/yc-w-cn/prisma-dto-generator/issues) • [📦 npm 包](https://www.npmjs.com/package/@yc-w-cn/prisma-dto-generator)

一个专为 Prisma Schema 设计的 DTO（Data Transfer Object）生成器，专注于为 Swagger/OpenAPI 文档提供类型安全的 DTO 类。

## 功能特性

- **🚀 自动 DTO 生成**: 基于 Prisma Schema 自动生成对应的 DTO 类
- **📋 基础 DTO 生成**: 为每个模型生成基础 DTO，包含所有模型字段
- **🎯 Swagger 优化**: 专门针对 Swagger/OpenAPI 文档格式优化
- **🔧 高度可配置**: 支持灵活的输出配置和生成选项
- **✨ 代码格式优化**: 自动优化装饰器缩进和导入语句分组
- **📏 格式一致性**: 确保生成的代码符合最佳代码格式规范

## 支持的 Prisma Providers

**⚠️ 重要说明**:

- ✅ **完全支持**: `prisma-client`
- ❌ **不支持**: `prisma-client-js`

如果您使用的是 `prisma-client-js` 作为 generator，请将 schema 中的 generator 配置修改为：

```prisma
generator client {
  provider = "prisma-client"  // 改为 prisma-client
}
```

## 安装

### 1. 安装包

```bash
# 使用 pnpm (推荐)
pnpm add -D @yc-w-cn/prisma-dto-generator

# 使用 npm
npm install -D @yc-w-cn/prisma-dto-generator

# 使用 yarn
yarn add -D @yc-w-cn/prisma-dto-generator
```

### 2. 安装 Prisma Client

```bash
# 使用 pnpm (推荐)
pnpm add -D @prisma/client

# 使用 npm
npm install -D @prisma/client

# 使用 yarn
yarn add -D @prisma/client
```

## 使用方法

### 1. 配置 Prisma Schema

在你的 `schema.prisma` 文件中配置此生成器：

```prisma
generator client {
  provider = "prisma-client"  // 重要：必须使用 prisma-client
}

datasource db {
  provider = "postgresql"     // 支持所有 Prisma 支持的数据库
  url      = env("DATABASE_URL")
}

// 你的模型定义
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
}
```

### 2. 配置生成器选项

在你的 Prisma schema 中添加生成器配置：

#### 基本配置示例
```prisma
generator dto {
  provider = "prisma-dto-generator"
  output           = "./generated/dto"
  emitUpdateReadonly = false
}
```

#### 高级配置示例（推荐用于自定义目录结构）
```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma-client"
}

generator dto {
  provider = "prisma-dto-generator"
  output           = "../src/generated/prisma-class"
  prismaClientPath = "@/generated/prisma-client"  # 确保枚举导入路径正确
  emitUpdateReadonly = false
}
```

#### 配置选项说明

- `output`: DTO 文件的输出目录（默认：`./generated/dto`）
- `prismaClientPath`: Prisma Client 的输出目录路径，用于正确计算枚举导入的相对路径（可选，默认使用 `../src/generated/prisma-client`）
- `emitUpdateReadonly`: 是否在更新 DTO 中包含只读字段（默认：`false`）
- `useDateType`: 是否将 DateTime 字段生成为 Date 类型（默认：`true`）
  - `true`: 生成 `Date` 类型，需要配合 `class-transformer` 和全局管道使用
  - `false`: 生成 `string` 类型，使用 `@IsDateString()` 验证

#### 代码格式优化特性

生成器会自动优化生成的代码格式，确保符合最佳实践：

- **装饰器缩进**: 
  - `@ApiProperty` 装饰器无缩进
  - `@IsOptional()`、`@Type()`、`@IsDate()`、`@IsDateString()` 等装饰器前保持 2 个空格缩进
  - 属性定义前保持 2 个空格缩进

- **导入语句分组**:
  - 官方包（`@nestjs/swagger`）单独一组
  - 第三方包（`class-validator` 和 `class-transformer`）合并为一组，包间使用换行分隔
  - 枚举导入单独一组
  - 不同包组间使用空行分隔，提升代码可读性

### 3. 运行生成

```bash
# 生成 DTO 文件
npx prisma generate
```

生成的 DTO 文件将保存在指定的输出目录中。

## 关于 prismaClientPath 配置的重要说明

### 为什么需要这个配置？

当你的 Prisma schema 中包含枚举字段时，生成的 DTO 需要正确导入这些枚举类型。`prismaClientPath` 配置项用于指定 Prisma Client 的输出目录，这样 DTO 生成器就能正确计算枚举导入的相对路径。

### 配置示例对比

**情况1：默认配置（不推荐用于自定义目录结构）**
```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma-client"
}

generator dto {
  provider = "prisma-dto-generator"
  output           = "../src/generated/prisma-class"
  # 未设置 prismaClientPath，将使用默认路径
}
```

**问题**：枚举导入路径可能不正确，导致 TypeScript 编译错误。

**情况2：推荐配置（正确设置相对路径）**
```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma-client"
}

generator dto {
  provider = "prisma-dto-generator"
  output           = "../src/generated/prisma-class"
  prismaClientPath = "@/generated/prisma-client"  # 正确设置
}
```

**优势**：
- 枚举导入路径正确计算
- 避免 TypeScript 编译错误
- 支持自定义目录结构

### 何时需要设置这个配置？

如果你遇到以下情况，建议设置 `prismaClientPath`：
1. 使用了自定义的 Prisma Client 输出目录
2. DTO 文件生成位置与 Prisma Client 输出目录不在同一层级
3. 出现枚举导入路径错误

## 生成的 DTO 示例

基于上面的 User 和 Post 模型，生成器会为每个模型生成基础 DTO 文件：

### UserDto.ts (useDateType: true)
```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UserDto {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: String })
  email: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  name?: string;

  @ApiProperty({ type: Date, format: 'date-time' })
  @Type(() => Date)
  @IsDate()
  createdAt: Date;

  @ApiProperty({ type: Date, format: 'date-time' })
  @Type(() => Date)
  @IsDate()
  updatedAt: Date;
}
```

### UserDto.ts (useDateType: false)
```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class UserDto {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: String })
  email: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  name?: string;

  @ApiProperty({ type: String, format: 'date-time' })
  @IsDateString()
  createdAt: string;

  @ApiProperty({ type: String, format: 'date-time' })
  @IsDateString()
  updatedAt: string;
}
```

## 全局管道配置

当 `useDateType: true` 时，需要在 NestJS 应用中配置全局管道，启用类型转换：

```typescript
import { ValidationPipe } from '@nestjs/common';

/** 
 * 全局管道: 验证和转换 DTO 
 */
app.useGlobalPipes(
  new ValidationPipe({
    transform: true, // <--- 必须开启！开启后 DTO 会根据类型自动转换
    transformOptions: {
      enableImplicitConversion: false, // 建议设为 false，显式使用 @Type 更安全
    },
    whitelist: true, // 自动剔除 DTO 中未定义的属性
  }),
);
```

## 最佳实践

### 1. API 文档集成

生成的 DTO 类可以直接用于 Swagger/OpenAPI 文档：

```typescript
import { UserDto, PostDto } from './generated/dto';

@Controller('users')
export class UserController {
  @Post()
  async create(@Body() createUserDto: UserDto): Promise<UserDto> {
    // 实现创建用户逻辑
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateUserDto: UserDto,
  ): Promise<UserDto> {
    // 实现更新用户逻辑
  }
}
```

### 2. Swagger 注解优化

生成的 DTO 可以配合 Swagger 注解使用：

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ 
    example: 1,
    description: '用户ID' 
  })
  id: number;

  @ApiProperty({ 
    example: 'user@example.com',
    description: '用户邮箱' 
  })
  email: string;

  @ApiProperty({ 
    example: '张三',
    description: '用户姓名',
    required: false 
  })
  name?: string;

  @ApiProperty({ 
    example: '2023-01-01T00:00:00.000Z',
    description: '创建时间' 
  })
  createdAt: Date;

  @ApiProperty({ 
    example: '2023-01-01T00:00:00.000Z',
    description: '更新时间' 
  })
  updatedAt: Date;
}
```

## CI/CD 和测试覆盖率

本项目使用 GitHub Actions 进行持续集成，并集成 Codecov 进行测试覆盖率监控。

### 持续集成 (CI)

- **自动测试**: 每次推送代码到 main 或 develop 分支，以及创建 pull request 到 main 分支时，会自动运行测试
- **多版本支持**: 支持 Node.js 20 版本测试
- **依赖缓存**: 使用 pnpm 缓存机制加速 CI 运行

### 测试覆盖率

[![codecov](https://codecov.io/github/yc-w-cn/prisma-dto-generator/graph/badge.svg?token=90F31MACL6)](https://codecov.io/github/yc-w-cn/prisma-dto-generator)

- **覆盖率报告**: 每次 CI 运行后自动上传测试覆盖率报告到 Codecov
- **详细分析**: 可以在 Codecov 网站上查看详细的覆盖率分析报告
- **徽章显示**: README 中显示实时测试覆盖率状态

### 本地测试

```bash
# 运行测试
pnpm test

# 运行测试并生成覆盖率报告
pnpm test:coverage
```

## 贡献

欢迎提交 [Issue](https://github.com/yc-w-cn/prisma-dto-generator/issues) 和 [Pull Request](https://github.com/yc-w-cn/prisma-dto-generator/pulls) 来改进这个项目！

### 仓库地址
🔗 [GitHub Repository](https://github.com/yc-w-cn/prisma-dto-generator)

### 作者信息
👨‍💻 **作者**: Yuchen Wang  
📧 **联系邮箱**: contact@wangyuchen.cn  

如果您在使用过程中遇到问题或有改进建议，请在 GitHub 上创建 Issue。

## 许可证

MIT License