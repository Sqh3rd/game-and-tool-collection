import type { SimpleTypes } from "./helperTypes";

type _Optional<T, NullOption extends undefined | null = null> = {
  filter: (filterFunc: (it: T) => boolean) => Optional<T, NullOption>;
  get: () => T | NullOption;
  isPresent: () => boolean;
  isType: <R extends keyof SimpleTypes>(
    type: R,
  ) => Optional<T & NonNullable<SimpleTypes[R]>, NullOption>;
  map: <R>(mapFn: (arg: T) => R) => Optional<NonNullable<R>, NullOption>;
  orElse: (other: T) => T;
  orElseGet: (otherGetter: () => T) => T;
  orThrow: () => T;

  tryAccess: T extends object ?
    <TKey extends keyof T>(key: TKey) => Optional<T[TKey], NullOption>
  : never;
};

export type Optional<T, NullOption extends undefined | null = null> = _Optional<
  NonNullable<T>,
  NullOption
>;

export const optional = <T, NullOption extends undefined | null = null>(
  it: T,
  nullOption: NullOption = null as NullOption,
): _Optional<NonNullable<T>, NullOption> => {
  return {
    filter: (filterFunc) =>
      optional(it && filterFunc(it) ? it : null, nullOption),
    get: () => it ?? nullOption,
    isPresent: () => !!it,
    isType: <R extends keyof SimpleTypes>(type: R) =>
      optional(it && typeof it === type ? it : null, nullOption) as Optional<
        T & NonNullable<SimpleTypes[R]>,
        NullOption
      >,
    map: (mapFn) => optional(it ? mapFn(it) : null, nullOption),
    orElse: (other) => it ?? other,
    orElseGet: (otherGetter) => it ?? otherGetter(),
    orThrow: () => {
      if (it) return it;
      throw new Error();
    },

    tryAccess: (<TKey extends keyof (T & object)>(key: TKey) =>
      optional(
        it && typeof it === "object" && key in it ? it[key] : null,
        nullOption,
      )) as _Optional<NonNullable<T>, NullOption>["tryAccess"],
  };
};
