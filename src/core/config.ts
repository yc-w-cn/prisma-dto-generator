export type GeneratorConfig = {
  output: string;
  emitRelations: boolean;
  emitUpdateReadonly: boolean;
  swaggerLibrary: 'nestjs';
  fileMaxLines: number;
  dtoKinds: ('base' | 'create' | 'update')[];
};

export function parseConfig(input: Record<string, unknown>): GeneratorConfig {
  const pickBool = (v: unknown, d: boolean) => (typeof v === 'boolean' ? v : d);
  const pickStr = (v: unknown, d: string) =>
    typeof v === 'string' && v.length ? v : d;
  const pickNum = (v: unknown, d: number) =>
    typeof v === 'number' && v > 0 ? v : d;
  const output = pickStr(input.output, './generated/dto');
  const emitRelations = pickBool(input.emitRelations, false);
  const emitUpdateReadonly = pickBool(input.emitUpdateReadonly, false);
  const swaggerLibrary = 'nestjs' as const;
  const fileMaxLines = pickNum(input.fileMaxLines, 100);
  const kindsRaw = input.dtoKinds;
  const dtoKinds: ('base' | 'create' | 'update')[] = Array.isArray(kindsRaw)
    ? (kindsRaw as unknown[])
        .map(String)
        .filter((k) => k === 'base' || k === 'create' || k === 'update')
    : ['base', 'create', 'update'];
  return {
    output,
    emitRelations,
    emitUpdateReadonly,
    swaggerLibrary,
    fileMaxLines,
    dtoKinds,
  };
}
