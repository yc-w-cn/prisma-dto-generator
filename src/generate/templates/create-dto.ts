import type { ModelDescriptor } from '../../core/dmmf';
import { renderImports, renderJSDoc, renderProp } from './common';

export function renderCreateDto(
  model: ModelDescriptor,
  className: string,
): string {
  const imports = renderImports(model, false);
  const header = renderJSDoc(`Create${className}Dto`, '自动生成的创建 DTO');
  const props = model.fields
    .filter((f) => f.kind !== 'object')
    .map((f) => `  ${renderProp(f, false)}`)
    .join('\n\n');
  return `${imports}\n${header}export class Create${className}Dto {\n${props ? props + '\n' : ''}}\n`;
}
