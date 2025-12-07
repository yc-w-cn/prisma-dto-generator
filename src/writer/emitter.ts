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
      renderBaseDto(
        m,
        className,
        ctx.config.prismaClientPath,
        ctx.config.useDateType,
      ),
      `${baseName}.dto.ts`,
    );
    exportStatements.push(
      `export { ${className}Dto } from './${baseName}.dto';`,
    );
  }

  // 生成 index.ts 导出文件
  if (exportStatements.length > 0) {
    const sortedExportStatements = exportStatements.sort((a, b) => {
      const classNameA = /export\s+\{\s*(\w+)\s*\}/.exec(a)?.[1] ?? '';
      const classNameB = /export\s+\{\s*(\w+)\s*\}/.exec(b)?.[1] ?? '';

      // 比较时去掉 Dto
      const nameA = classNameA.replace(/Dto$/, '');
      const nameB = classNameB.replace(/Dto$/, '');

      return nameA.localeCompare(nameB, 'en', { sensitivity: 'base' });
    });

    const indexContent = sortedExportStatements.join('\n') + '\n';
    emitOne(ctx, indexContent, 'index.ts');
  }
}

function emitOne(ctx: Ctx, content: string, fileName: string) {
  writeTextFile(join(ctx.outputDir, fileName), content);
}
