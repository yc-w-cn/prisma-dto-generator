import { generatorHandler, GeneratorOptions } from '@prisma/generator-helper';

import { parseConfig } from './core/config';
import { toModelDescriptors } from './core/dmmf';
import { emitAll } from './writer/emitter';

generatorHandler({
  onManifest() {
    return {
      version: __APP_VERSION__,
      defaultOutput: './generated/dto',
      prettyName: 'Prisma DTO Generator (Swagger)',
    };
  },
  async onGenerate(options: GeneratorOptions) {
    // options 的范例文件参考: docs/generated-config.json
    const cfg = parseConfig(options.generator.config, options.schemaPath);
    const models = toModelDescriptors(options.dmmf);
    await emitAll({
      outputDir: cfg.output,
      models,
      config: cfg,
      schemaPath: options.schemaPath,
    });
  },
});
