import SuperJSON from "superjson";

export const _serialize = <T>(it: T): T =>
  SuperJSON.stringify(it) as unknown as T;
