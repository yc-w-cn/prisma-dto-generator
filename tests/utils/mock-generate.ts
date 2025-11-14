import { emitAll } from '../../src/writer/emitter'
import type { GeneratorConfig } from '../../src/core/config'
import type { ModelDescriptor } from '../../src/core/dmmf'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

export async function onGenerate() {
  const dir = mkdtempSync(join(tmpdir(), 'dto-'))
  const cfg: GeneratorConfig = {
    output: dir,
    emitRelations: false,
    emitUpdateReadonly: false,
    swaggerLibrary: 'nestjs',
    fileMaxLines: 100,
    dtoKinds: ['base', 'create', 'update']
  }
  const models: ModelDescriptor[] = [
    {
      name: 'User',
      enums: [],
      fields: [
        { name: 'id', kind: 'scalar', type: 'Int', isList: false, isRequired: true },
        { name: 'email', kind: 'scalar', type: 'String', isList: false, isRequired: true },
        { name: 'createdAt', kind: 'scalar', type: 'DateTime', isList: false, isRequired: true }
      ]
    }
  ]
  await emitAll({ outputDir: dir, models, config: cfg })
}