import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type { GeneratorConfig } from '@/core/config';
import type { ModelDescriptor } from '@/core/dmmf';
import { emitAll } from '@/writer/emitter';

function tmp(): string {
  return mkdtempSync(join(tmpdir(), 'dto-'));
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
    isNullable: false,
  })),
};

const cfg: GeneratorConfig = {
  output: '',
  emitRelations: false,
  emitUpdateReadonly: false,
  swaggerLibrary: 'nestjs',
  dtoKinds: ['base'],
};

describe('emitter', () => {
  test('generates DTO files', async () => {
    const dir = tmp();
    cfg.output = dir;
    await emitAll({ outputDir: dir, models: [model], config: cfg });
    const content = readFileSync(join(dir, 'post.dto.ts'), 'utf8');
    expect(content).toContain('export class PostDto');
    expect(content).toContain('ApiProperty');
    rmSync(dir, { recursive: true, force: true });
  });
});
