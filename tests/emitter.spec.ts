import { emitAll } from '../src/writer/emitter'
import type { ModelDescriptor } from '../src/core/dmmf'
import type { GeneratorConfig } from '../src/core/config'
import { readFileSync, rmSync } from 'node:fs'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

function tmp(): string {
  return mkdtempSync(join(tmpdir(), 'dto-'))
}

const model: ModelDescriptor = {
  name: 'Post',
  enums: [],
  fields: new Array(40).fill(0).map((_, i) => ({
    name: `f${i}`,
    kind: 'scalar',
    type: 'String',
    isList: false,
    isRequired: true,
    isNullable: false
  }))
}

const cfg: GeneratorConfig = {
  output: '',
  emitRelations: false,
  emitUpdateReadonly: false,
  swaggerLibrary: 'nestjs',
  fileMaxLines: 50,
  dtoKinds: ['base']
}

describe('emitter', () => {
  test('splits long files', async () => {
    const dir = tmp()
    cfg.output = dir
    await emitAll({ outputDir: dir, models: [model], config: cfg })
    const content = readFileSync(join(dir, 'post.dto.ts'), 'utf8')
    expect(content.split('\n').length).toBeLessThanOrEqual(50)
    rmSync(dir, { recursive: true, force: true })
  })
})