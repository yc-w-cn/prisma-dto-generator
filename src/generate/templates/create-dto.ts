import type { ModelDescriptor } from '../../core/dmmf';
import { renderImportsOptional, renderJSDoc, renderProp } from './common';

function filterCreateFields(model: ModelDescriptor): ModelDescriptor['fields'] {
  return model.fields.filter((f) => f.kind !== 'object');
}

export function renderCreateDto(
  model: ModelDescriptor,
  className: string,
): string {
  const imports = renderImportsOptional(false);
  const header = renderJSDoc(`Create${className}Dto`, '自动生成的创建 DTO');
  const fields = filterCreateFields(model);
  const props = fields.map((f) => `  ${renderProp(f, false)}`).join('\n\n');
  return `${imports}\n${header}export class Create${className}Dto {\n${props ? props + '\n' : ''}}\n`;
}
