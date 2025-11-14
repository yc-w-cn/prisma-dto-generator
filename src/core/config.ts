import { dirname, join } from 'node:path';

export type GeneratorConfig = {
  output: string;
  emitRelations: boolean;
  emitUpdateReadonly: boolean;
  swaggerLibrary: 'nestjs';
  dtoKinds: readonly ('base' | 'create' | 'update')[];
  prismaClientPath?: string;
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
    (output.startsWith('../') || output.startsWith('./'))
  ) {
    const schemaDir = dirname(schemaPath);
    output = join(schemaDir, output);
  }

  const emitRelations = pickBool(input.emitRelations, false);
  const emitUpdateReadonly = pickBool(input.emitUpdateReadonly, false);
  const swaggerLibrary = 'nestjs' as const;
  const kindsRaw = input.dtoKinds;
  const dtoKinds: ('base' | 'create' | 'update')[] = Array.isArray(kindsRaw)
    ? (kindsRaw as unknown[])
        .map(String)
        .filter((k) => k === 'base' || k === 'create' || k === 'update')
    : ['base', 'create', 'update'];
  const prismaClientPath = pickStrOpt(input.prismaClientPath);
  return {
    output,
    emitRelations,
    emitUpdateReadonly,
    swaggerLibrary,
    dtoKinds,
    prismaClientPath,
  };
}
