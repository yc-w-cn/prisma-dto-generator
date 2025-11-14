import type { GeneratorConfig } from '../../core/config';
import type { ModelDescriptor } from '../../core/dmmf';
import { renderImportsOptional, renderJSDoc, renderProp } from './common';

export function renderUpdateDto(
  model: ModelDescriptor,
  className: string,
  cfg: GeneratorConfig,
): string {
  const imports = renderImportsOptional(true);
  const header = renderJSDoc(`Update${className}Dto`, '自动生成的更新 DTO');
  const fields = cfg.emitUpdateReadonly
    ? model.fields
    : model.fields.filter((f) => f.kind !== 'object');
  const props = fields
    .map((f) => `  ${renderProp({ ...f, isRequired: false }, true)}`)
    .join('\n\n');
  return `${imports}\n${header}export class Update${className}Dto {\n${props ? props + '\n' : ''}}\n`;
}
