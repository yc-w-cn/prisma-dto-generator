import { dirname, join } from 'node:path';

export type GeneratorConfig = {
  output: string;
  emitUpdateReadonly: boolean;
  swaggerLibrary: 'nestjs';
  prismaClientPath?: string;
  useDateType: boolean;
};

export function parseConfig(
  input: Record<string, unknown>,
  schemaPath?: string,
): GeneratorConfig {
  const pickBool = (v: unknown, d: boolean) => (typeof v === 'boolean' ? v : d);
  const pickStr = (v: unknown, d: string) =>
    typeof v === 'string' && v.length ? v : d;
  const pickStrOpt = (v: unknown) =>
    typeof v === 'string' && v.length ? v : undefined;

  // 解析 output 配置，处理相对路径
  let output = pickStr(input.output, './generated/dto');

  // 只有当用户明确配置了相对路径时，才相对于 schema 路径进行解析
  if (
    schemaPath &&
    input.output &&
    typeof input.output === 'string' &&
    (output.startsWith('../') ||
      output.startsWith('./') ||
      output.includes('\\'))
  ) {
    const schemaDir = dirname(schemaPath);
    // 使用规范化路径处理复杂的相对路径组合
    output = join(schemaDir, output);
  }

  const emitUpdateReadonly = pickBool(input.emitUpdateReadonly, false);
  const swaggerLibrary = 'nestjs' as const;
  const prismaClientPath = pickStrOpt(input.prismaClientPath);
  const useDateType = pickBool(input.useDateType, true);
  return {
    output,
    emitUpdateReadonly,
    swaggerLibrary,
    prismaClientPath,
    useDateType,
  };
}
