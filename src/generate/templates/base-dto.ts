import type { ModelDescriptor } from '../../core/dmmf';
import { renderImports, renderJSDoc, renderProp } from './common';

export function renderBaseDto(
  model: ModelDescriptor,
  className: string,
  prismaClientPath?: string,
  useDateType = true,
) {
  const imports = renderImports(model, false, prismaClientPath, useDateType);
  const header = renderJSDoc(`${className}Dto`);
  const props = model.fields
    .filter((f) => !f.relationName) // 过滤掉关联字段
    .map((f) => `  ${renderProp(f, false, useDateType)}`)
    .join('\n\n');
  return `${imports}\n${header}export class ${className}Dto {\n${props ? props + '\n' : ''}}\n`;
}
