import type { ModelDescriptor } from '../../core/dmmf';
import { renderImports, renderJSDoc, renderProp } from './common';

export function renderBaseDto(
  model: ModelDescriptor,
  className: string,
  prismaClientPath?: string,
) {
  const imports = renderImports(model, false, prismaClientPath);
  const header = renderJSDoc(`${className}Dto`, '自动生成的基础 DTO');
  const props = model.fields
    .map((f) => renderProp(f, false))
    .filter((prop) => prop.trim() !== '') // 过滤掉空字符串的字段
    .map((prop) => `  ${prop}`)
    .join('\n\n');
  return `${imports}\n${header}export class ${className}Dto {\n${props ? props + '\n' : ''}}\n`;
}
