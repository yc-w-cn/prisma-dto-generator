import type { GeneratorConfig } from '@/core/config';
import type { ModelDescriptor } from '@/core/dmmf';

import { renderImports, renderJSDoc, renderProp } from './common';

export function renderUpdateDto(
  model: ModelDescriptor,
  className: string,
  config: GeneratorConfig,
  schemaPath: string,
): string {
  const imports = renderImports(
    model,
    true,
    schemaPath,
    config.prismaClientPath,
  );
  const header = renderJSDoc(`Update${className}Dto`, '自动生成的更新 DTO');
  const props = model.fields
    .filter((f) => f.kind !== 'object' && !f.isRequired)
    .map((f) => `  ${renderProp(f, true)}`)
    .join('\n\n');
  return `${imports}\n${header}export class Update${className}Dto {\n${props ? props + '\n' : ''}}\n`;
}
