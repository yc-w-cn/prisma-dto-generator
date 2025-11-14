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
  const base =
    scalar === 'String'
      ? 'string'
      : scalar === 'Int'
        ? 'number'
        : scalar === 'BigInt'
          ? 'string'
          : scalar === 'Float'
            ? 'number'
            : scalar === 'Decimal'
              ? 'number'
              : scalar === 'Boolean'
                ? 'boolean'
                : scalar === 'DateTime'
                  ? 'string'
                  : scalar === 'Json'
                    ? 'Record<string, any>'
                    : scalar === 'Bytes'
                      ? 'string'
                      : 'any';
  return nullable ? `${base} | null` : base;
}

export function toSwaggerMeta(
  scalar: Scalar,
  opts: { isArray?: boolean; nullable?: boolean },
): SwaggerMeta {
  const format =
    scalar === 'Int'
      ? 'int32'
      : scalar === 'BigInt'
        ? 'int64'
        : scalar === 'Float' || scalar === 'Decimal'
          ? 'double'
          : scalar === 'DateTime'
            ? 'date-time'
            : scalar === 'Bytes'
              ? 'byte'
              : undefined;
  const typeRef =
    scalar === 'Boolean'
      ? 'Boolean'
      : scalar === 'Json'
        ? 'Object'
        : scalar === 'DateTime'
          ? 'String'
          : scalar === 'Int' || scalar === 'Float' || scalar === 'Decimal'
            ? 'Number'
            : 'String';
  return {
    typeRef,
    format,
    isArray: !!opts.isArray,
    nullable: !!opts.nullable,
  };
}
