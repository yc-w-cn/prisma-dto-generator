import { join } from 'node:path';

import { writeTextFile } from '@/utils/fs';
import { toKebabCase, toPascalCase } from '@/utils/naming';

import type { GeneratorConfig } from '@/core/config';
import type { ModelDescriptor } from '@/core/dmmf';
import { renderBaseDto } from '@/generate/templates/base-dto';

type Ctx = {
  outputDir: string;
  models: ModelDescriptor[];
  config: GeneratorConfig;
  schemaPath: string;
};

export function emitAll(
  config: GeneratorConfig,
  models: ModelDescriptor[],
  schemaPath: string,
  outputDir: string,
): void {
  const ctx: Ctx = {
    config,
    models,
    schemaPath,
    outputDir,
  };

  const exportStatements: string[] = [];

  for (const m of ctx.models) {
    const baseName = toKebabCase(m.name);
    const className = toPascalCase(m.name);

    emitOne(
      ctx,
      renderBaseDto(m, className, ctx.config.prismaClientPath),
      `${baseName}.dto.ts`,
    );
    exportStatements.push(
      `export { ${className}Dto } from './${baseName}.dto';`,
    );
  }

  // 生成 index.ts 导出文件
  if (exportStatements.length > 0) {
    emitOne(ctx, exportStatements.join('\n'), 'index.ts');
  }
}

function emitOne(ctx: Ctx, content: string, fileName: string) {
  writeTextFile(join(ctx.outputDir, fileName), content);
}
