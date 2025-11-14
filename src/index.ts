import { generatorHandler, GeneratorOptions } from '@prisma/generator-helper';

import { parseConfig } from './core/config';
import { toModelDescriptors } from './core/dmmf';
import { emitAll } from './writer/emitter';

generatorHandler({
  onManifest() {
    return {
      version: '0.1.0',
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
