import type { FieldDescriptor } from '../../core/dmmf';
import { toSwaggerMeta, toTsType } from '../../core/type-map';

export function renderImportsOptional(optional: boolean): string {
  const base = optional ? `ApiProperty, ApiPropertyOptional` : `ApiProperty`;
  return `import { ${base} } from '@nestjs/swagger'\n`;
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
  return `${decorator}(${meta})\n${field.name}: ${field.isList ? `${tsType}[]` : tsType}`;
}
