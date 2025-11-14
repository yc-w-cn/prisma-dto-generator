import { join } from 'node:path'
import { writeTextFile, splitByLines } from '../utils/fs'
import { toKebabCase, toPascalCase } from '../utils/naming'
import type { ModelDescriptor } from '../core/dmmf'
import type { GeneratorConfig } from '../core/config'
import { renderBaseDto } from '../generate/templates/base-dto'
import { renderCreateDto } from '../generate/templates/create-dto'
import { renderUpdateDto } from '../generate/templates/update-dto'

type Ctx = { outputDir: string; models: ModelDescriptor[]; config: GeneratorConfig }

export async function emitAll(ctx: Ctx) {
  for (const m of ctx.models) {
    const baseName = toKebabCase(m.name)
    const className = toPascalCase(m.name)
    if (ctx.config.dtoKinds.includes('base')) emitOne(ctx, renderBaseDto(m, className), `${baseName}.dto.ts`)
    if (ctx.config.dtoKinds.includes('create')) emitOne(ctx, renderCreateDto(m, className), `create-${baseName}.dto.ts`)
    if (ctx.config.dtoKinds.includes('update')) emitOne(ctx, renderUpdateDto(m, className, ctx.config), `update-${baseName}.dto.ts`)
  }
}

function emitOne(ctx: Ctx, content: string, fileName: string) {
  const chunks = splitByLines(content, ctx.config.fileMaxLines)
  if (chunks.length === 1) {
    writeTextFile(join(ctx.outputDir, fileName), chunks[0])
    return
  }
  for (let i = 0; i < chunks.length; i++) {
    const suffix = i === 0 ? '' : `.part-${i + 1}`
    const name = fileName.replace(/\.ts$/, `${suffix}.ts`)
    writeTextFile(join(ctx.outputDir, name), chunks[i])
  }
}