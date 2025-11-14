# Prisma DTO Generator (Swagger)

[![GitHub Repository](https://img.shields.io/badge/GitHub-@yc--w--cn/prisma--dto--generator-blue.svg)](https://github.com/yc-w-cn/prisma-dto-generator)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Author](https://img.shields.io/badge/Author-Wang%20Yuchen-orange.svg)](mailto:contact@wangyuchen.cn)

一个专为 Prisma Schema 设计的 DTO（Data Transfer Object）生成器，专注于为 Swagger/OpenAPI 文档提供类型安全的 DTO 类。

## 功能特性

- **🚀 自动 DTO 生成**: 基于 Prisma Schema 自动生成对应的 DTO 类
- **📋 支持多种 DTO 类型**: 
  - 基础 DTO（Base DTO）- 包含所有模型字段
  - 创建 DTO（Create DTO）- 用于创建新实体的字段
  - 更新 DTO（Update DTO）- 用于更新现有实体的字段
- **🔗 关系支持**: 可选生成关联模型的 DTO
- **🎯 Swagger 优化**: 专门针对 Swagger/OpenAPI 文档格式优化
- **🔧 高度可配置**: 支持灵活的输出配置和生成选项

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

```prisma
generator dto_generator {
  provider = "@yc-w-cn/prisma-dto-generator"
  output           = "./generated/dto"
  emitRelations    = true
  emitUpdateReadonly = false
  fileMaxLines     = 100
  dtoKinds         = ["base", "create", "update"]
}
```

#### 配置选项说明

- `output`: DTO 文件的输出目录（默认：`./generated/dto`）
- `emitRelations`: 是否生成关联模型的 DTO（默认：`false`）
- `emitUpdateReadonly`: 是否在更新 DTO 中包含只读字段（默认：`false`）
- `fileMaxLines`: 单个 DTO 文件的最大行数（默认：`100`）
- `dtoKinds`: 要生成的 DTO 类型数组（默认：`["base", "create", "update"]`）

### 3. 运行生成

```bash
# 生成 DTO 文件
npx prisma generate
```

生成的 DTO 文件将保存在指定的输出目录中。

## 生成的 DTO 示例

基于上面的 User 和 Post 模型，生成器会创建以下 DTO 文件：

### UserBaseDto.ts
```typescript
export class UserBaseDto {
  id: number;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### UserCreateDto.ts
```typescript
export class UserCreateDto {
  email: string;
  name?: string;
}
```

### UserUpdateDto.ts
```typescript
export class UserUpdateDto {
  email?: string;
  name?: string;
}
```

### PostCreateDto.ts (启用关系时)
```typescript
export class PostCreateDto {
  title: string;
  content?: string;
  published?: boolean;
  authorId: number;
}
```

## 最佳实践

### 1. API 文档集成

生成的 DTO 类可以直接用于 Swagger/OpenAPI 文档：

```typescript
import { UserCreateDto, UserUpdateDto, UserBaseDto } from './generated/dto';

@Controller('users')
export class UserController {
  @Post()
  async create(@Body() createUserDto: UserCreateDto): Promise<UserBaseDto> {
    // 实现创建用户逻辑
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateUserDto: UserUpdateDto,
  ): Promise<UserBaseDto> {
    // 实现更新用户逻辑
  }
}
```

### 2. Swagger 注解优化

生成的 DTO 可以配合 Swagger 注解使用：

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class UserCreateDto {
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
}
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