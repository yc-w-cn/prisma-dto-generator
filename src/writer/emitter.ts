import { join } from 'node:path';

import { writeTextFile } from '@/utils/fs';
import { toKebabCase, toPascalCase } from '@/utils/naming';

import type { GeneratorConfig } from '@/core/config';
import type { ModelDescriptor } from '@/core/dmmf';
import { renderBaseDto } from '@/generate/templates/base-dto';
import { renderCreateDto } from '@/generate/templates/create-dto';
import { renderUpdateDto } from '@/generate/templates/update-dto';

type Ctx = {
  outputDir: string;
  models: ModelDescriptor[];
  config: GeneratorConfig;
};

export async function emitAll(ctx: Ctx) {
  for (const m of ctx.models) {
    const baseName = toKebabCase(m.name);
    const className = toPascalCase(m.name);
    if (ctx.config.dtoKinds.includes('base'))
      emitOne(ctx, renderBaseDto(m, className), `${baseName}.dto.ts`);
    if (ctx.config.dtoKinds.includes('create'))
      emitOne(ctx, renderCreateDto(m, className), `create-${baseName}.dto.ts`);
    if (ctx.config.dtoKinds.includes('update'))
      emitOne(
        ctx,
        renderUpdateDto(m, className, ctx.config),
        `update-${baseName}.dto.ts`,
      );
  }
}

function emitOne(ctx: Ctx, content: string, fileName: string) {
  writeTextFile(join(ctx.outputDir, fileName), content);
}
