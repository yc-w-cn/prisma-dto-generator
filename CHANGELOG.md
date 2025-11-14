# 更新日志

本项目遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/) 格式规范。

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