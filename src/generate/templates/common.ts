import type { FieldDescriptor, ModelDescriptor } from '@/core/dmmf';
import { toSwaggerMeta, toTsType } from '@/core/type-map';

export function renderImports(
  model: ModelDescriptor,
  optionalMode: boolean,
  prismaClientPath?: string,
  useDateType = true,
): string {
  const usedSwaggerDecorators = new Set<string>();
  const usedValidatorDecorators = new Set<string>();
  const usedTransformerDecorators = new Set<string>();
  const usedEnums = new Set<string>();

  // 分析模型字段，确定需要哪些装饰器和枚举
  for (const field of model.fields) {
    if (field.relationName) continue;

    const isOptional = optionalMode || !field.isRequired;
    const swaggerDecorator = isOptional ? 'ApiPropertyOptional' : 'ApiProperty';
    usedSwaggerDecorators.add(swaggerDecorator);

    // 检查是否需要验证器装饰器
    if (isOptional) {
      usedValidatorDecorators.add('IsOptional');
    }

    // 如果是日期类型字段
    if (field.kind === 'scalar' && field.type === 'DateTime') {
      if (useDateType) {
        usedValidatorDecorators.add('IsDate');
        usedTransformerDecorators.add('Type');
      } else {
        usedValidatorDecorators.add('IsDateString');
      }
    }

    // 如果是枚举字段，记录枚举类型
    if (field.kind === 'enum') {
      usedEnums.add(field.type);
    }
  }

  // 生成导入语句
  const importStatements: string[] = [];

  // 添加 @nestjs/swagger 导入
  if (usedSwaggerDecorators.size > 0) {
    const decorators = Array.from(usedSwaggerDecorators).join(', ');
    importStatements.push(`import { ${decorators} } from '@nestjs/swagger';`);
  }

  // 添加 class-validator 导入
  if (usedValidatorDecorators.size > 0) {
    const decorators = Array.from(usedValidatorDecorators).join(', ');
    importStatements.push(`import { ${decorators} } from 'class-validator';`);
  }

  // 添加 class-transformer 导入
  if (usedTransformerDecorators.size > 0) {
    const decorators = Array.from(usedTransformerDecorators).join(', ');
    importStatements.push(`import { ${decorators} } from 'class-transformer';`);
  }

  // 添加枚举导入
  if (usedEnums.size > 0) {
    const enums = Array.from(usedEnums).join(', ');

    // 直接使用配置的prismaClientPath路径，如果未配置则使用默认路径
    const enumPath = prismaClientPath
      ? `${prismaClientPath}/enums`
      : '@/generated/prisma-client/enums';

    importStatements.push(`import { ${enums} } from '${enumPath}';`);
  }

  // 如果没有使用任何导入，返回空字符串
  if (importStatements.length === 0) {
    return '';
  }

  // 按照指定顺序排列导入语句，中间添加空行
  return importStatements.join('\n\n') + '\n';
}

export function renderJSDoc(title: string, description?: string): string {
  const desc = description ? `\n * ${description}` : '';
  return `/**\n * ${title}${desc}\n */\n`;
}

export function renderProp(
  field: FieldDescriptor,
  optionalMode: boolean,
  useDateType = true,
): string {
  const isScalar = field.kind === 'scalar';
  const isEnum = field.kind === 'enum';
  const swagger = isScalar
    ? toSwaggerMeta(field.type as any, { isArray: field.isList, useDateType })
    : isEnum
      ? { typeRef: 'String', isArray: field.isList }
      : { typeRef: 'Object', isArray: field.isList };
  const isOptional = optionalMode || !field.isRequired;
  const decorator = isOptional ? 'ApiPropertyOptional' : 'ApiProperty';
  const metaParts = [
    `type: ${swagger.isArray ? `[${swagger.typeRef}]` : swagger.typeRef}`,
    swagger.format ? `format: '${swagger.format}'` : '',
    swagger.isArray ? `isArray: true` : '',
    '',
  ].filter(Boolean);
  const meta = metaParts.length ? `{ ${metaParts.join(', ')} }` : '';
  const tsType = isScalar
    ? toTsType(field.type as any, false, useDateType)
    : isEnum
      ? field.type
      : 'unknown';

  // 生成装饰器数组
  const decorators: string[] = [];

  // 添加swagger装饰器
  decorators.push(`@${decorator}(${meta})`);

  // 添加可选装饰器
  if (isOptional) {
    decorators.push('  @IsOptional()');
  }

  // 添加日期类型相关装饰器
  if (isScalar && field.type === 'DateTime') {
    if (useDateType) {
      decorators.push('  @Type(() => Date)');
      decorators.push('  @IsDate()');
    } else {
      decorators.push('  @IsDateString()');
    }
  }

  return [
    ...decorators,
    `  ${field.name}: ${field.isList ? `${tsType}[]` : tsType}${field.isRequired ? '' : ' | null'}`,
  ].join('\n');
}
