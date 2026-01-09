export type PrimitiveStringLiterals =
  | "string"
  | "number"
  | "bigint"
  | "boolean"
  | "symbol"
  | "undefined"
  | "object"
  | "function";

export type PrimitiveFromStringLiteral<T extends PrimitiveStringLiterals> =
  T extends "string" ? string
  : T extends "number" ? number
  : T extends "bigint" ? bigint
  : T extends "boolean" ? boolean
  : T extends "symbol" ? symbol
  : T extends "object" ? object
  : // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  T extends "function" ? Function
  : undefined;
