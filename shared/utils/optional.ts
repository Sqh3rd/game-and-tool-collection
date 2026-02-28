type _Optional<T, NullOption extends undefined | null = null> = {
  filter: (filterFunc: (it: T) => boolean) => Optional<T, NullOption>;
  map: <R>(mapFn: (arg: T) => R) => Optional<NonNullable<R>, NullOption>;
  isPresent: () => boolean;
  get: () => T | NullOption;
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
    map: (mapFn) => optional(it ? mapFn(it) : null, nullOption),
    filter: (filterFunc) =>
      optional(it && filterFunc(it) ? it : null, nullOption),
    isPresent: () => !!it,
    get: () => it ?? nullOption,
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
