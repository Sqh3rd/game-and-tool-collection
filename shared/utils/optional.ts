export type Optional<T> = {
    map: <R>(mapFn: (arg: NonNullable<T>) => R) => Optional<R>;
    isPresent: () => boolean;
    get: () => T | null;
    orThrow: () => NonNullable<T>;

    tryAccess: T extends object ? <TKey extends keyof T>(key: TKey) => Optional<T[TKey]> : never;
};

export const optional = <T>(it: T): Optional<T> => ({
    map: <R>(mapFn: (arg: NonNullable<T>) => R) => it ? optional(mapFn(it)) : optional(null as R),
    isPresent: () => !!it,
    get: () => it ?? null,
    orThrow: () => {
        if (it) return it;
        throw new Error();},

    tryAccess: (<TKey extends keyof T>(key: TKey) => typeof it === "object" && it && key in it ? optional(it[key]) : optional(null)) as Optional<T>["tryAccess"]
})