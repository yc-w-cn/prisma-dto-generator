## 问题分析
- dmmf 字段无 `isNullable` 属性，当前代码在 `src/core/dmmf.ts:28` 访问了不存在的属性，导致 TS2339。
- `options.generator.config` 允许出现 `string[]`（如 `previewFeatures`），`src/index.ts:16` 将其传入 `parseConfig`（签名为 `Record<string, string | number | boolean | undefined>`）造成 TS2345。

## 修改方案
- 移除对 `isNullable` 的依赖，仅以 `isRequired` 控制必填/可选；Swagger 中的 `nullable` 不再推断（未来可从注释或配置扩展）。
- 放宽配置解析类型签名，支持 `string[]` 等 union；`dtoKinds` 仍按数组解析，其他未知键忽略。

## 逐文件修改
- `src/core/dmmf.ts`
  - 更新 `FieldDescriptor`：删除 `isNullable`。
  - `toModelDescriptors` 生成时不再读取 `isNullable`。
- `src/generate/templates/common.ts`
  - `renderProp`：
    - 计算 Swagger 元数据时不再传 `nullable`，仅根据 `isArray` 和 `format`。
    - TS 类型不追加 `| null`，使用 `toTsType(scalar, false)`。
    - 根据 `isRequired` 与 `optionalMode` 选择 `ApiProperty` 或 `ApiPropertyOptional`。
- `src/generate/templates/base-dto.ts` / `create-dto.ts` / `update-dto.ts`
  - 适配 `FieldDescriptor` 的变更；`update` 仍将所有字段视为可选（`optionalMode=true`）。
- `src/core/type-map.ts`
  - 保留现有接口；调用端统一以 `nullable=false`。
- `src/core/config.ts`
  - 将 `parseConfig` 输入签名改为 `Record<string, unknown>`。
  - `dtoKinds` 解析：当为数组时过滤到 `['base','create','update']`，否则使用默认值。
  - 其余布尔/字符串/数字解析保持不变。
- `src/index.ts`
  - 与新签名兼容，直接传入 `options.generator.config`。

## 验证
- 运行现有 Jest 测试，确保模板与写入器行为不变。
- 重点检查 `templates-base.spec.ts`、`emitter.spec.ts` 产物；`roles: Role[]` 仍保持一致。

## 影响与兼容
- 功能不减：仍支持 Swagger 注解与文件分片。
- 更严谨：避免错误地标注 `nullable`；未来可通过配置或注释增强此能力。