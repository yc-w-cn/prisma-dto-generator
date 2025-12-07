import { toModelDescriptors } from '@/core/dmmf';

describe('DMMF文档转换', () => {
  describe('toModelDescriptors 函数', () => {
    test('应该将简单模型转换为描述符', () => {
      // 使用 any 类型来避免复杂的 DMMF.Document 类型定义
      const dmmf: any = {
        datamodel: {
          models: [
            {
              name: 'User',
              fields: [
                {
                  name: 'id',
                  kind: 'scalar',
                  type: 'Int',
                  isList: false,
                  isRequired: true,
                  isUnique: false,
                  isId: true,
                  isReadOnly: false,
                  hasDefaultValue: false,
                  default: undefined,
                  relationName: undefined,
                  relationFromFields: undefined,
                  relationToFields: undefined,
                  relationOnDelete: undefined,
                },
                {
                  name: 'name',
                  kind: 'scalar',
                  type: 'String',
                  isList: false,
                  isRequired: true,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  hasDefaultValue: false,
                  default: undefined,
                  relationName: undefined,
                  relationFromFields: undefined,
                  relationToFields: undefined,
                  relationOnDelete: undefined,
                },
              ],
              uniqueFields: [],
              uniqueIndexes: [],
              isGenerated: false,
              dbName: null,
            },
          ],
          enums: [],
          types: [],
          indexes: [],
        },
        schema: {
          rootQueryType: 'Query',
          rootMutationType: 'Mutation',
          types: [],
        },
        mappings: {
          modelOperations: [],
          modelActionMap: {},
          outputs: {},
        },
      };

      const result = toModelDescriptors(dmmf);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: 'User',
        fields: [
          {
            name: 'id',
            kind: 'scalar',
            type: 'Int',
            isList: false,
            isRequired: true,
            relationName: undefined,
          },
          {
            name: 'name',
            kind: 'scalar',
            type: 'String',
            isList: false,
            isRequired: true,
            relationName: undefined,
          },
        ],
        enums: [],
      });
    });

    test('应该处理包含枚举的模型', () => {
      const dmmf: any = {
        datamodel: {
          models: [
            {
              name: 'Post',
              fields: [
                {
                  name: 'id',
                  kind: 'scalar',
                  type: 'Int',
                  isList: false,
                  isRequired: true,
                  isUnique: false,
                  isId: true,
                  isReadOnly: false,
                  hasDefaultValue: false,
                  default: undefined,
                  relationName: undefined,
                  relationFromFields: undefined,
                  relationToFields: undefined,
                  relationOnDelete: undefined,
                },
                {
                  name: 'status',
                  kind: 'enum',
                  type: 'PostStatus',
                  isList: false,
                  isRequired: true,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  hasDefaultValue: false,
                  default: undefined,
                  relationName: undefined,
                  relationFromFields: undefined,
                  relationToFields: undefined,
                  relationOnDelete: undefined,
                },
              ],
              uniqueFields: [],
              uniqueIndexes: [],
              isGenerated: false,
              dbName: null,
            },
          ],
          enums: [
            {
              name: 'PostStatus',
              values: [
                { name: 'DRAFT', dbName: null },
                { name: 'PUBLISHED', dbName: null },
                { name: 'ARCHIVED', dbName: null },
              ],
              dbName: null,
            },
          ],
          types: [],
          indexes: [],
        },
        schema: {
          rootQueryType: 'Query',
          rootMutationType: 'Mutation',
          types: [],
        },
        mappings: {
          modelOperations: [],
          modelActionMap: {},
          outputs: {},
        },
      };

      const result = toModelDescriptors(dmmf);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: 'Post',
        fields: [
          {
            name: 'id',
            kind: 'scalar',
            type: 'Int',
            isList: false,
            isRequired: true,
            relationName: undefined,
          },
          {
            name: 'status',
            kind: 'enum',
            type: 'PostStatus',
            isList: false,
            isRequired: true,
            relationName: undefined,
          },
        ],
        enums: ['PostStatus'],
      });
    });

    test('应该处理包含关系的模型', () => {
      const dmmf: any = {
        datamodel: {
          models: [
            {
              name: 'Comment',
              fields: [
                {
                  name: 'id',
                  kind: 'scalar',
                  type: 'Int',
                  isList: false,
                  isRequired: true,
                  isUnique: false,
                  isId: true,
                  isReadOnly: false,
                  hasDefaultValue: false,
                  default: undefined,
                  relationName: undefined,
                  relationFromFields: undefined,
                  relationToFields: undefined,
                  relationOnDelete: undefined,
                },
                {
                  name: 'post',
                  kind: 'object',
                  type: 'Post',
                  isList: false,
                  isRequired: true,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  hasDefaultValue: false,
                  default: undefined,
                  relationName: 'PostComments',
                  relationFromFields: ['postId'],
                  relationToFields: ['id'],
                  relationOnDelete: 'Cascade',
                },
              ],
              uniqueFields: [],
              uniqueIndexes: [],
              isGenerated: false,
              dbName: null,
            },
          ],
          enums: [],
          types: [],
          indexes: [],
        },
        schema: {
          rootQueryType: 'Query',
          rootMutationType: 'Mutation',
          types: [],
        },
        mappings: {
          modelOperations: [],
          modelActionMap: {},
          outputs: {},
        },
      };

      const result = toModelDescriptors(dmmf);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: 'Comment',
        fields: [
          {
            name: 'id',
            kind: 'scalar',
            type: 'Int',
            isList: false,
            isRequired: true,
            relationName: undefined,
          },
          {
            name: 'post',
            kind: 'object',
            type: 'Post',
            isList: false,
            isRequired: true,
            relationName: 'PostComments',
          },
        ],
        enums: [],
      });
    });

    test('应该处理包含数组字段的模型', () => {
      const dmmf: any = {
        datamodel: {
          models: [
            {
              name: 'Product',
              fields: [
                {
                  name: 'id',
                  kind: 'scalar',
                  type: 'Int',
                  isList: false,
                  isRequired: true,
                  isUnique: false,
                  isId: true,
                  isReadOnly: false,
                  hasDefaultValue: false,
                  default: undefined,
                  relationName: undefined,
                  relationFromFields: undefined,
                  relationToFields: undefined,
                  relationOnDelete: undefined,
                },
                {
                  name: 'tags',
                  kind: 'scalar',
                  type: 'String',
                  isList: true,
                  isRequired: false,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  hasDefaultValue: false,
                  default: undefined,
                  relationName: undefined,
                  relationFromFields: undefined,
                  relationToFields: undefined,
                  relationOnDelete: undefined,
                },
              ],
              uniqueFields: [],
              uniqueIndexes: [],
              isGenerated: false,
              dbName: null,
            },
          ],
          enums: [],
          types: [],
          indexes: [],
        },
        schema: {
          rootQueryType: 'Query',
          rootMutationType: 'Mutation',
          types: [],
        },
        mappings: {
          modelOperations: [],
          modelActionMap: {},
          outputs: {},
        },
      };

      const result = toModelDescriptors(dmmf);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: 'Product',
        fields: [
          {
            name: 'id',
            kind: 'scalar',
            type: 'Int',
            isList: false,
            isRequired: true,
            relationName: undefined,
          },
          {
            name: 'tags',
            kind: 'scalar',
            type: 'String',
            isList: true,
            isRequired: false,
            relationName: undefined,
          },
        ],
        enums: [],
      });
    });

    test('应该处理包含多个模型和枚举的文档', () => {
      const dmmf: any = {
        datamodel: {
          models: [
            {
              name: 'User',
              fields: [
                {
                  name: 'id',
                  kind: 'scalar',
                  type: 'Int',
                  isList: false,
                  isRequired: true,
                  isUnique: false,
                  isId: true,
                  isReadOnly: false,
                  hasDefaultValue: false,
                  default: undefined,
                  relationName: undefined,
                  relationFromFields: undefined,
                  relationToFields: undefined,
                  relationOnDelete: undefined,
                },
              ],
              uniqueFields: [],
              uniqueIndexes: [],
              isGenerated: false,
              dbName: null,
            },
            {
              name: 'Post',
              fields: [
                {
                  name: 'id',
                  kind: 'scalar',
                  type: 'Int',
                  isList: false,
                  isRequired: true,
                  isUnique: false,
                  isId: true,
                  isReadOnly: false,
                  hasDefaultValue: false,
                  default: undefined,
                  relationName: undefined,
                  relationFromFields: undefined,
                  relationToFields: undefined,
                  relationOnDelete: undefined,
                },
              ],
              uniqueFields: [],
              uniqueIndexes: [],
              isGenerated: false,
              dbName: null,
            },
          ],
          enums: [
            {
              name: 'UserRole',
              values: [
                { name: 'ADMIN', dbName: null },
                { name: 'USER', dbName: null },
              ],
              dbName: null,
            },
            {
              name: 'PostStatus',
              values: [
                { name: 'DRAFT', dbName: null },
                { name: 'PUBLISHED', dbName: null },
              ],
              dbName: null,
            },
          ],
          types: [],
          indexes: [],
        },
        schema: {
          rootQueryType: 'Query',
          rootMutationType: 'Mutation',
          types: [],
        },
        mappings: {
          modelOperations: [],
          modelActionMap: {},
          outputs: {},
        },
      };

      const result = toModelDescriptors(dmmf);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        name: 'User',
        fields: [
          {
            name: 'id',
            kind: 'scalar',
            type: 'Int',
            isList: false,
            isRequired: true,
            relationName: undefined,
          },
        ],
        enums: ['UserRole', 'PostStatus'],
      });
      expect(result[1]).toEqual({
        name: 'Post',
        fields: [
          {
            name: 'id',
            kind: 'scalar',
            type: 'Int',
            isList: false,
            isRequired: true,
            relationName: undefined,
          },
        ],
        enums: ['UserRole', 'PostStatus'],
      });
    });

    test('应该处理空文档', () => {
      const dmmf: any = {
        datamodel: {
          models: [],
          enums: [],
          types: [],
          indexes: [],
        },
        schema: {
          rootQueryType: 'Query',
          rootMutationType: 'Mutation',
          types: [],
        },
        mappings: {
          modelOperations: [],
          modelActionMap: {},
          outputs: {},
        },
      };

      const result = toModelDescriptors(dmmf);

      expect(result).toHaveLength(0);
    });
  });
});
