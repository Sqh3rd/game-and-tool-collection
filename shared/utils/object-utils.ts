type KeyValuePairs<T extends object> = keyof T extends infer A ? A extends keyof T ? [A, T[A]] : never : never;

export const getEntries = Object.entries as <T extends object>(it: T) => KeyValuePairs<T>[];

export const getKeys = Object.keys as <T extends object>(it: T) => (keyof T)[]

type MergeResult<T1 extends object, T2 extends object, R> = Record<keyof T1 | keyof T2, T1[keyof T1] | T2[keyof T2] | R>;
type MergeStrategy<T1 extends object, T2 extends object, R> = (val1: T1[keyof T1], val2: T2[keyof T2]) => R;
export const merge = <T1 extends object, T2 extends object, R>(a: T1, b: T2, strategy: MergeStrategy<NoInfer<T1>, NoInfer<T2>, R>): MergeResult<T1, T2, R> => {
    const merged = {} as MergeResult<T1, T2, R>;
    const keys = new Set<keyof T1 | keyof T2>();
    const isKeyInBoth = (key: keyof T1 | keyof T2): key is keyof T1 & keyof T2 => key in a && key in b;
    const isKeyIn = <T extends T1 | T2>(key: keyof T1 | keyof T2, it: T): key is (keyof T1 | keyof T2) & keyof T => key in it;
    getKeys(a).forEach(key => keys.add(key));
    getKeys(b).forEach(key => keys.add(key));
    for (const key of keys) {
        if (isKeyInBoth(key))
            merged[key] = strategy(a[key], b[key]);
        else if (isKeyIn(key, a))
            merged[key] = a[key];
        else if (isKeyIn(key, b))
            merged[key] = b[key];
    }
    return merged;
}
export const mergeStrategies = {
    concat: <
        T1 extends object,
        T2 extends object
    >(): MergeStrategy<T1, T2, [T1[keyof T1], T2[keyof T2]]> => ((v1, v2) => [v1, v2]),
    concatFlat: <
        T1 extends Record<string | number | symbol, unknown[]>,
        T2 extends Record<string | number | symbol, unknown[]>
    >(): MergeStrategy<T1, T2, [...T1[keyof T1], ...T2[keyof T2]]> => (v1, v2) => [...v1, ...v2],
}