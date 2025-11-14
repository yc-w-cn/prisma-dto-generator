## 项目目标
- 基于 Prisma 官方 Generator 接口，实现 DTO 代码生成器
- 仅生成 DTO（不包含 TypeGraphQL、resolver 等），并添加 Swagger 注解
- 兼容当前最新版 Prisma Schema/Generator（通过 DMMF 驱动，不依赖 prisma-client-js）
- 产物 TypeScript，包管理器使用 `pnpm`
- 生成文件遵循命名与体积约束：小写文件名，单文件 ≤ 100 行，必须合理拆分
- 生成代码包含函数级注释（JSDoc），文件级顶部注释交由外部插件处理

## 交付物
- `@prisma/generator-helper` 驱动的可发布 NPM 包（生成器主体）
- DTO 代码生成：为每个模型生成 `model.dto.ts`、`create-model.dto.ts`、`update-model.dto.ts`
- Swagger 注解：使用 `@nestjs/swagger`（`ApiProperty`/`ApiPropertyOptional`，枚举、数组、格式等元数据）
- 完整 Jest 测试（快照 + 行为测试）
- 示例 `generator` 块配置与使用说明

## 架构设计
- `src/index.ts`：注册 Prisma `generatorHandler`（`onManifest`、`onGenerate`）
- `src/core/dmmf.ts`：DMMF 解析、模型与枚举抽象（ModelDescriptor/EnumDescriptor）
- `src/core/type-map.ts`：Prisma 标量 → TS 类型、Swagger 元数据映射
- `src/core/config.ts`：生成器配置解析与默认值（只用 TS 类型，无额外库）
- `src/generate/templates/`：
  - `base-dto.ts`：生成模型基础 DTO（只含可读字段）
  - `create-dto.ts`：生成创建 DTO（去除只读/自动字段）
  - `update-dto.ts`：生成更新 DTO（所有字段可选）
  - `common.ts`：属性行模板、导入语句、JSDoc 生成
- `src/utils/`：`naming.ts`（kebab/camel 转换）、`fs.ts`（安全写入、行数限制与拆分）、`logger.ts`
- `src/writer/emitter.ts`：输出结构编排（按模型拆分为多个小文件，强制 ≤100 行）

## 生成策略
- 字段选择
  - BaseDTO：包含模型所有可读字段（`@id`、普通标量、枚举、关系的外键）
  - CreateDTO：排除自增/只读字段（如 `@default(autoincrement())`、`@updatedAt`）
  - UpdateDTO：全部字段可选（`ApiPropertyOptional`），保留只读字段以便文档完整性，可通过配置排除
- 类型映射（TS 与 Swagger）
  - `String → string (type: String)`
  - `Int → number (type: Number, format: 'int32')`
  - `BigInt → string (type: String, format: 'int64')`
  - `Float/Decimal → number (type: Number, format: 'double')`
  - `Boolean → boolean (type: Boolean)`
  - `DateTime → Date | string (type: String, format: 'date-time')`
  - `Json → Record<string, any> (type: Object)`
  - `Bytes → string (type: String, format: 'byte')`
  - `Enum → 对应 TS 联合类型，Swagger `enum`
  - 列表：`isList` → `type: [T]`（Swagger `isArray: true`，`items` 指定）
- 可选/可空
  - 可选字段：使用 `ApiPropertyOptional` 或 `ApiProperty({ required: false })`
  - 可空字段：在 TS 类型后追加 `| null`，Swagger 中保留 `nullable: true`
- 关系字段
  - 默认只发射外键标量，不生成嵌套 DTO（避免体积膨胀）
  - 通过配置 `emitRelations: true` 可生成最小化关系引用（仅 ID 列表/ID），仍保证文件 ≤100 行
- 导入管理
  - 统一从 `@nestjs/swagger` 导入注解；枚举类型本地生成或复用 Prisma Enum 的 TS 声明
- 注释
  - 每个生成函数均添加简洁 JSDoc（函数级注释）

## Prisma 集成
- `onManifest`：声明生成器名称、`prettyName`、`requiresGenerators`（兼容当前 prisma）
- `onGenerate`：接收 DMMF 与用户配置，调用 emitter 输出到 `output` 路径
- `schema.prisma` 样例
```
generator dto {
  provider = "node node_modules/prisma-dto-generator"
  output   = "./src/dto"
  emitRelations = false
  emitUpdateReadonly = false
}
```

## 配置项（可扩展）
- `output`：输出目录（默认 `./generated/dto`）
- `emitRelations`：是否生成关系字段（默认 `false`）
- `emitUpdateReadonly`：更新 DTO 是否包含只读字段（默认 `false`）
- `swaggerLibrary`：`nestjs`（预留扩展）
- `fileMaxLines`：每文件最大行数（默认 `100`）
- `dtoKinds`：`['base','create','update']`（可裁剪）

## 测试方案（Jest）
- 依赖：`jest`、`ts-jest`、`@types/jest`；测试不依赖 `@nestjs/swagger` 运行时，仅断言生成字符串
- 单元测试
  - `type-map.spec.ts`：标量/枚举/数组/可空映射
  - `templates/*.spec.ts`：属性模板、导入、JSDoc、可选与必填
  - `emitter.spec.ts`：行数统计与拆分策略（强制 ≤100 行）
  - `config.spec.ts`：默认值与用户覆盖
- 集成测试
  - 使用 `@prisma/internals` 的 `getDMMF` 解析内联 schema 字符串
  - 生成示例 DTO，做快照与语义断言（包含 `ApiProperty`、`enum`、`isArray`、`nullable` 等）
  - 大模型（≥80 字段）体积控制测试：验证自动拆分文件数量与导出完整性

## 包管理与脚本（pnpm）
- `pnpm build`：`tsc` 编译生成器
- `pnpm test`：Jest 运行测试
- `pnpm lint`：ESLint（可选）
- `pnpm prepare`：生成发布所需入口（保持最小化）

## 实现细节约束
- 文件命名：统一 kebab-case 小写
- 每个模块 ≤100 行；如逻辑趋近上限，拆分到 `templates/common` 或 `utils` 子模块
- 不引入不必要第三方库；核心仅使用 Prisma Helper 与 Node API

## 里程碑
1. 初始化生成器框架（Manifest/Generate、DMMF 读取与模型抽象）
2. 类型映射与模板输出（Base/Create/Update 三类）
3. Emitter 与体积控制（≤100 行）、导入与命名
4. Swagger 注解完善（枚举、数组、nullable/optional、format 映射）
5. Jest 单元与集成测试覆盖（≥90%）
6. 示例 `schema.prisma` 与使用文档片段（不启动服务器）

## 验收标准
- 针对任意标准 Prisma 模型，自动生成可编译的 DTO 文件
- Swagger 注解准确反映类型、枚举、数组、可选、可空与格式
- 无文件超过 100 行；大模型自动拆分，导出无缺失
- 测试通过、可在 Mac 上使用 `pnpm` 构建与测试