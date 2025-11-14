import type { FieldDescriptor, ModelDescriptor } from '@/core/dmmf';
import { toSwaggerMeta, toTsType } from '@/core/type-map';

export function renderImports(
  model: ModelDescriptor,
  optionalMode: boolean,
): string {
  const usedDecorators = new Set<string>();

  // 分析模型字段，确定需要哪些装饰器
  for (const field of model.fields) {
    const isOptional = optionalMode || !field.isRequired;
    const decorator = isOptional ? 'ApiPropertyOptional' : 'ApiProperty';
    usedDecorators.add(decorator);
  }

  // 如果没有使用任何装饰器，返回空字符串
  if (usedDecorators.size === 0) {
    return '';
  }

  // 生成导入语句
  const decorators = Array.from(usedDecorators).join(', ');
  return `import { ${decorators} } from '@nestjs/swagger';\n`;
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
