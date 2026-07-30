import { Values } from "../helper.types";

export type KeyValuePairs<T extends object> =
  keyof T extends infer A ?
    A extends keyof T ?
      [A, T[A]]
    : never
  : never;

export interface FunctionWrapper<Func extends (...args: unknown[]) => unknown> {
  (...args: Parameters<Func>): ReturnType<Func>;
}

export type CallableObject<
  Func extends (...args: unknown[]) => unknown,
  Obj extends object,
> = FunctionWrapper<Func> & Obj;

export type MergeResult<T1 extends object, T2 extends object, R> = Record<
  keyof T1 | keyof T2,
  T1[keyof T1] | T2[keyof T2] | R
>;
export type MergeStrategy<T1 extends object, T2 extends object, R> = (
  val1: T1[keyof T1],
  val2: T2[keyof T2],
) => R;

export interface MergeFunction {
  <T1 extends object, T2 extends object, R>(
    a: T1,
    b: T2,
    strategy: MergeStrategy<NoInfer<T1>, NoInfer<T2>, R>,
  ): MergeResult<T1, T2, R>;

  concat: {
    <T1 extends object, T2 extends object>(
      a: T1,
      b: T2,
    ): MergeResult<T1, T2, Values<T1> | Values<T2> | [Values<T1>, Values<T2>]>;

    flat: <
      T1 extends Record<string | number | symbol, unknown[]>,
      T2 extends Record<string | number | symbol, unknown[]>,
    >(
      a: T1,
      b: T2,
    ) => MergeResult<
      T1,
      T2,
      Values<T1> | Values<T2> | [...Values<T1>, ...Values<T2>]
    >;
  };
}
