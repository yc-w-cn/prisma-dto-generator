# 更新日志

本项目遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/) 格式规范。

## [v0.2.1] - 2025-11-15

### 变更 (Changed)
- **优化字段过滤逻辑**：对于关系字段等非标量、非枚举类型的字段，不再生成 `unknown` 类型，而是直接过滤掉这些字段
- **改进DTO生成质量**：生成的DTO类现在只包含真正需要的标量字段和枚举字段，更加简洁

### 修复 (Fixed)
- **修复字段类型处理**：当字段类型无法确定时，不再生成无效的类型声明，避免出现 `unknown` 类型
- **优化代码生成格式**：确保生成的DTO类格式整洁，避免不必要的属性声明

## [v0.2.0] - 2025-11-15

### 重大变更 (Breaking Changes)
- **移除多DTO类型支持**：不再支持生成创建DTO（Create DTO）和更新DTO（Update DTO），现在只生成基础DTO（Base DTO）
- **移除关系支持配置**：删除了 `emitRelations` 配置选项，不再支持生成关联模型的DTO
- **移除DTO类型配置**：删除了 `dtoKinds` 配置选项，简化了配置接口

### 重构 (Refactored)
- **简化配置接口**：移除了复杂的多DTO类型配置，现在配置更加简洁直观
- **优化模板生成逻辑**：移除了关系字段处理逻辑，简化了代码结构
- **改进枚举导入路径**：直接使用配置的 `prismaClientPath` 路径，不再进行复杂的相对路径计算
- **优化文件头部格式**：修复了导入语句生成时多余空行的问题

### 修复 (Fixed)
- **修复输出路径处理**：直接使用 Prisma 提供的绝对路径，确保输出路径准确性
- **修复枚举导入路径**：确保默认路径正确包含 `enums` 子路径
- **修复导入语句格式**：避免生成连续空行，提升代码可读性

### 文档更新 (Documentation)
- **更新README文档**：移除了 `emitRelations` 和 `dtoKinds` 相关内容，更新了配置示例和DTO示例
- **更新API文档集成示例**：适配新的基础DTO命名规范
- **更新Swagger注解示例**：反映仅生成基础DTO的现状

## [v0.1.3] - 2025-11-15

### 新增 (Added)
- 添加全局变量 `__APP_VERSION__` 用于在编译时获取应用版本号

## [v0.1.2] - 2025-11-15

### 变更 (Changed)

- 使用 tsup 替代 tsc 处理构建，解决 TypeScript 路径别名 (@/*) 在运行时无法正确解析的问题

### 重构 (Refactored)
- 将bin命令从@yc-w-cn/prisma-dto-generator改为prisma-dto-generator

## [v0.1.1] - 2025-11-15

### 新增 (Added)
- 动态获取 package.json 中的版本号替换硬编码

### 修复 (Fixed)
- 修复包名使用作用域包后无法执行的问题（`/bin/sh: @yc-w-cn/prisma-dto-generator: No such file or directory`）
- 添加 `bin` 配置到 package.json，修复 Prisma 找不到生成器可执行文件的问题
- 修复 TypeScript 配置，移除 `"type": "module"` 改为 CommonJS 格式，确保生成器兼容 Prisma 环境

## [v0.1.0] - 2025-11-15

### 新增 (Added)
- 首个正式版本发布
- 基于 Prisma Schema 的 DTO 自动生成功能
- 支持基础 DTO（Base DTO）、创建 DTO（Create DTO）和更新 DTO（Update DTO）生成
- 可配置的生成选项：
  - `output` - DTO 文件输出目录（默认：`./generated/dto`）
  - `emitRelations` - 是否生成关联模型的 DTO（默认：`false`）
  - `emitUpdateReadonly` - 是否在更新 DTO 中包含只读字段（默认：`false`）
  - `fileMaxLines` - 单个 DTO 文件的最大行数（默认：`100`）
  - `dtoKinds` - 要生成的 DTO 类型数组（默认：`["base", "create", "update"]`）
- 完整的 TypeScript 类型定义支持
- 详细的 README 文档和使用说明

### 修复 (Fixed)
- 确保生成的 DTO 代码符合 TypeScript 严格模式要求

### 已知问题 (Known Issues)
- 当前仅支持 `prisma-client` generator，不支持 `prisma-client-js`