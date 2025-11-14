import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type { GeneratorConfig } from '@/core/config';
import type { ModelDescriptor } from '@/core/dmmf';
import { emitAll } from '@/writer/emitter';

export async function onGenerate() {
  const dir = mkdtempSync(join(tmpdir(), 'dto-'));
  const cfg: GeneratorConfig = {
    output: dir,
    emitRelations: false,
    emitUpdateReadonly: false,
    swaggerLibrary: 'nestjs',
    dtoKinds: ['base', 'create', 'update'],
  };
  const models: ModelDescriptor[] = [
    {
      name: 'User',
      enums: [],
      fields: [
        {
          name: 'id',
          kind: 'scalar',
          type: 'Int',
          isList: false,
          isRequired: true,
        },
        {
          name: 'email',
          kind: 'scalar',
          type: 'String',
          isList: false,
          isRequired: true,
        },
        {
          name: 'createdAt',
          kind: 'scalar',
          type: 'DateTime',
          isList: false,
          isRequired: true,
        },
      ],
    },
  ];
  await emitAll({ outputDir: dir, models, config: cfg });
}
