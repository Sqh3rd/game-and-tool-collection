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
