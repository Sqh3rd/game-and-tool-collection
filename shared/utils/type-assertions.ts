import type { ServerError } from "../types/common";
import type {
  PrimitiveFromStringLiteral,
  PrimitiveStringLiterals,
} from "./helper-types";

export function isNotNull<T>(it: T | null | undefined): it is T {
  return it != null;
}

export function assertNotNull<T>(it: T | null | undefined): asserts it is T {
  if (!isNotNull(it)) throw new Error("Expected value to not be null");
}

export const notNull = <T>(it: T | null | undefined): T => {
  assertNotNull(it);
  return it;
};

export function isPrimitive<T extends PrimitiveStringLiterals>(
  it: unknown,
  primitive: T,
): it is PrimitiveFromStringLiteral<T> {
  return typeof it === primitive;
}

export function containsAll<T extends object, S extends string[]>(it: T, keys: S): it is T & {[key in S[number]]: unknown} {
  return keys.every(key => key in it);
}

export function isServerError(it: unknown): it is ServerError {
  const keys: (keyof ServerError)[] = ["cause", "data", "fatal", "message", "name", "stack", "statusCode"];
}