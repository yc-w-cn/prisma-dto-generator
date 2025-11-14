import type { DMMF } from '@prisma/generator-helper';

export type FieldDescriptor = {
  name: string;
  kind: 'scalar' | 'enum' | 'object';
  type: string;
  isList: boolean;
  isRequired: boolean;
};

export type ModelDescriptor = {
  name: string;
  fields: FieldDescriptor[];
  enums: string[];
};

export function toModelDescriptors(doc: DMMF.Document): ModelDescriptor[] {
  const enums = new Set(doc.datamodel.enums.map((e) => e.name));
  return doc.datamodel.models.map((model) => ({
    name: model.name,
    fields: model.fields.map((f) => ({
      name: f.name,
      kind: f.kind as FieldDescriptor['kind'],
      type: f.type,
      isList: f.isList,
      isRequired: f.isRequired,
    })),
    enums: Array.from(enums),
  }));
}
