import { Values } from "../helper.types";
import {
  CallableObject,
  KeyValuePairs,
  MergeFunction,
  MergeResult,
  MergeStrategy,
} from "./object-utils.types";

export const getEntries = Object.entries as <T extends object>(
  it: T,
) => KeyValuePairs<T>[];

export const getKeys = Object.keys as <T extends object>(it: T) => (keyof T)[];

export const cloneFunc =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  <Params extends any[], R>(func: (...args: Params) => R) =>
    (...args: Params) =>
      func(...args);

export const createCallableObject = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Func extends (...args: any[]) => any,
  FactoryReturn extends object,
>(
  func: Func,
  factory: (base: Func) => FactoryReturn,
) =>
  Object.assign(
    cloneFunc(func),
    factory(func) as CallableObject<Func, FactoryReturn>,
  );

export const merge = createCallableObject(
  <T1 extends object, T2 extends object, R>(
    a: T1,
    b: T2,
    strategy: MergeStrategy<NoInfer<T1>, NoInfer<T2>, R>,
  ): MergeResult<T1, T2, R> => {
    const merged = {} as MergeResult<T1, T2, R>;
    const keys = new Set<keyof T1 | keyof T2>();
    const isKeyInBoth = (
      key: keyof T1 | keyof T2,
    ): key is keyof T1 & keyof T2 => key in a && key in b;
    const isKeyIn = <T extends T1 | T2>(
      key: keyof T1 | keyof T2,
      it: T,
    ): key is (keyof T1 | keyof T2) & keyof T => key in it;
    getKeys(a).forEach((key) => keys.add(key));
    getKeys(b).forEach((key) => keys.add(key));
    for (const key of keys) {
      if (isKeyInBoth(key)) merged[key] = strategy(a[key], b[key]);
      else if (isKeyIn(key, a)) merged[key] = a[key];
      else if (isKeyIn(key, b)) merged[key] = b[key];
    }
    return merged;
  },
  (mergeFn) => ({
    concat: createCallableObject(
      <T1 extends object, T2 extends object>(
        a: T1,
        b: T2,
      ): MergeResult<
        T1,
        T2,
        Values<T1> | Values<T2> | [Values<T1>, Values<T2>]
      > => mergeFn(a, b, (v1, v2) => [v1, v2]),

      (_) => ({
        flat: <
          T1 extends Record<string | number | symbol, unknown[]>,
          T2 extends Record<string | number | symbol, unknown[]>,
        >(
          a: T1,
          b: T2,
        ): MergeResult<
          T1,
          T2,
          Values<T1> | Values<T2> | [...Values<T1>, ...Values<T2>]
        > => mergeFn(a, b, (v1, v2) => [...v1, ...v2]),
      }),
    ),
  }),
) as MergeFunction;
