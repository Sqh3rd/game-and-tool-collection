import SuperJSON from "superjson";

export const _parse = (it: unknown) => SuperJSON.parse(it as string);
