import { dirname, join, relative } from 'node:path';

import type { FieldDescriptor, ModelDescriptor } from '@/core/dmmf';
import { toSwaggerMeta, toTsType } from '@/core/type-map';

export function renderImports(
  model: ModelDescriptor,
  optionalMode: boolean,
  schemaPath: string,
  prismaClientPath?: string,
): string {
  const usedDecorators = new Set<string>();
  const usedEnums = new Set<string>();

  // 分析模型字段，确定需要哪些装饰器和枚举
  for (const field of model.fields) {
    const isOptional = optionalMode || !field.isRequired;
    const decorator = isOptional ? 'ApiPropertyOptional' : 'ApiProperty';
    usedDecorators.add(decorator);

    // 如果是枚举字段，记录枚举类型
    if (field.kind === 'enum') {
      usedEnums.add(field.type);
    }
  }

  // 生成导入语句
  const importStatements: string[] = [];

  // 添加 @nestjs/swagger 导入
  if (usedDecorators.size > 0) {
    const decorators = Array.from(usedDecorators).join(', ');
    importStatements.push(`import { ${decorators} } from '@nestjs/swagger';`);
  }

  // 添加枚举导入
  if (usedEnums.size > 0) {
    const enums = Array.from(usedEnums).join(', ');

    // 计算基于Prisma文件的相对路径
    const schemaDir = dirname(schemaPath);

    // 使用配置的prismaClientPath路径，如果未配置则使用默认路径
    const enumPath = prismaClientPath
      ? join(schemaDir, prismaClientPath, 'enums')
      : join(schemaDir, '../src/generated/prisma-client/enums');

    const relativePath = relative(schemaDir, enumPath).replace(/\\/g, '/'); // 确保使用正斜杠

    // 确保路径以./开头，如果没有相对路径前缀
    const finalPath = relativePath.startsWith('../')
      ? relativePath
      : `./${relativePath}`;

    importStatements.push(`import { ${enums} } from '${finalPath}';`);
  }

  // 如果没有使用任何导入，返回空字符串
  if (importStatements.length === 0) {
    return '';
  }

  // 按照指定顺序排列导入语句，中间添加空行
  return importStatements.join('\n\n') + '\n\n';
}

export function renderJSDoc(title: string, description?: string): string {
  const desc = description ? `\n * ${description}` : '';
  return `/**\n * ${title}${desc}\n */\n`;
}

export function renderProp(
  field: FieldDescriptor,
  optionalMode: boolean,
): string {
  const isScalar = field.kind === 'scalar';
  const isEnum = field.kind === 'enum';
  const swagger = isScalar
    ? toSwaggerMeta(field.type as any, { isArray: field.isList })
    : isEnum
      ? { typeRef: 'String', isArray: field.isList }
      : { typeRef: 'Object', isArray: field.isList };
  const decorator =
    optionalMode || !field.isRequired ? 'ApiPropertyOptional' : 'ApiProperty';
  const metaParts = [
    `type: ${swagger.isArray ? `[${swagger.typeRef}]` : swagger.typeRef}`,
    swagger.format ? `format: '${swagger.format}'` : '',
    swagger.isArray ? `isArray: true` : '',
    '',
  ].filter(Boolean);
  const meta = metaParts.length ? `{ ${metaParts.join(', ')} }` : '';
  const tsType = isScalar
    ? toTsType(field.type as any, false)
    : isEnum
      ? field.type
      : 'unknown';
  return [
    `@${decorator}(${meta})`,
    `  ${field.name}: ${field.isList ? `${tsType}[]` : tsType};`,
  ].join('\n');
}
