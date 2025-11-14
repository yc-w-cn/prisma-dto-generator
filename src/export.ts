/**
 * Prisma DTO Generator 导出文件
 *
 * 此文件导出所有核心功能，方便用户直接使用
 */

import { GeneratorConfig } from './core/config';
import { ModelDescriptor, toModelDescriptors } from './core/dmmf';
import { emitAll } from './writer/emitter';

// 导出核心配置功能
export { type GeneratorConfig, parseConfig } from './core/config';

// 导出 DMMF 相关功能
export {
  type FieldDescriptor,
  type ModelDescriptor,
  toModelDescriptors,
} from './core/dmmf';

// 导出类型映射功能
export {
  type Scalar,
  type SwaggerMeta,
  toSwaggerMeta,
  toTsType,
} from './core/type-map';

// 导出模板生成功能
export { renderBaseDto } from './generate/templates/base-dto';
export { renderCreateDto } from './generate/templates/create-dto';
export { renderUpdateDto } from './generate/templates/update-dto';

// 导出工具函数
export { ensureDir, writeTextFile } from './utils/fs';
export { toKebabCase, toPascalCase } from './utils/naming';

// 导出主生成器功能
export { emitAll } from './writer/emitter';

/**
 * 快速生成 DTO 的便捷函数
 */
export async function generateDTOs(
  models: ModelDescriptor[],
  config: GeneratorConfig,
): Promise<void> {
  await emitAll({
    outputDir: config.output,
    models,
    config,
  });
}

/**
 * 从 DMMF 文档直接生成 DTO 的便捷函数
 */
export async function generateFromDMMF(
  dmmf: any,
  config: GeneratorConfig,
): Promise<void> {
  const models = toModelDescriptors(dmmf);
  await generateDTOs(models, config);
}
