import * as fs from 'fs';
import * as path from 'path';

import { generatorHandler, GeneratorOptions } from '@prisma/generator-helper';

import { parseConfig } from './core/config';
import { toModelDescriptors } from './core/dmmf';
import { emitAll } from './writer/emitter';

// 动态获取版本号
function getVersion(): string {
  const packageJsonPath = path.resolve(__dirname, '../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  return packageJson.version;
}

generatorHandler({
  onManifest() {
    return {
      version: getVersion(),
      defaultOutput: './generated/dto',
      prettyName: 'Prisma DTO Generator (Swagger)',
    };
  },
  async onGenerate(options: GeneratorOptions) {
    const cfg = parseConfig(options.generator.config);
    const models = toModelDescriptors(options.dmmf);
    await emitAll({ outputDir: cfg.output, models, config: cfg });
  },
});
