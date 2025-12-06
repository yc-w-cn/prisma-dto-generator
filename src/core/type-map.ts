export type Scalar =
  | 'String'
  | 'Int'
  | 'BigInt'
  | 'Float'
  | 'Decimal'
  | 'Boolean'
  | 'DateTime'
  | 'Json'
  | 'Bytes';

export type SwaggerMeta = {
  typeRef: string;
  isArray?: boolean;
  enumValues?: string[];
  format?: string;
  nullable?: boolean;
};

export function toTsType(scalar: Scalar, nullable: boolean): string {
  let base: string;

  switch (scalar) {
    case 'String':
    case 'Bytes':
    case 'BigInt':
      base = 'string';
      break;
    case 'DateTime':
      base = 'Date';
      break;
    case 'Int':
    case 'Float':
    case 'Decimal':
      base = 'number';
      break;
    case 'Boolean':
      base = 'boolean';
      break;
    case 'Json':
      base = 'Record<string, any>';
      break;
    default:
      base = 'any';
  }

  return nullable ? `${base} | null` : base;
}

export function toSwaggerMeta(
  scalar: Scalar,
  opts: { isArray?: boolean; nullable?: boolean },
): SwaggerMeta {
  let format: string | undefined;
  switch (scalar) {
    case 'Int':
      format = 'int32';
      break;
    case 'BigInt':
      format = 'int64';
      break;
    case 'Float':
    case 'Decimal':
      format = 'double';
      break;
    case 'DateTime':
      format = 'date-time';
      break;
    case 'Bytes':
      format = 'byte';
      break;
    default:
      format = undefined;
  }

  let typeRef: string;
  switch (scalar) {
    case 'Boolean':
      typeRef = 'Boolean';
      break;
    case 'Json':
      typeRef = 'Object';
      break;
    case 'DateTime':
      typeRef = 'Date';
      break;
    case 'Int':
    case 'Float':
    case 'Decimal':
      typeRef = 'Number';
      break;
    default:
      typeRef = 'String';
  }

  return {
    typeRef,
    format,
    isArray: !!opts.isArray,
    nullable: !!opts.nullable,
  };
}
