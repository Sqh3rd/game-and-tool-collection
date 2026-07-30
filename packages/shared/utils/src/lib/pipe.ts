import { identity } from "./helper-functions";
import { createCallableObject } from "./object-utils/object-utils";

export interface Pipe<In, Out> {
  (arg: In): Out;

  func: <T>(func: (arg: Out) => T) => Pipe<In, T>;
  after: <T>(pipe: Pipe<Out, T>) => Pipe<In, T>;
}

export const pipe = <In, Out>(it: (arg: In) => Out): Pipe<In, Out> =>
  createCallableObject(
    (arg: In) => it(arg),
    (base) => ({
      func: <T>(func: (arg: Out) => T) => pipe((arg: In) => func(base(arg))),
      after: <T>(next: Pipe<Out, T>) => pipe((arg: In) => next(base(arg))),
    }),
  );

export interface ModificationPipe<T> {
  (arg: T): T;

  func: (func: (arg: T) => Partial<T>) => ModificationPipe<T>;
  after: (pipe: ModificationPipe<T>) => ModificationPipe<T>;
}

export const modificationPipe = <T>(
  it: (arg: T) => Partial<T> = identity,
): ModificationPipe<T> =>
  createCallableObject(
    (arg: T) => ({ ...arg, ...it(arg) }),
    (base) => ({
      func: (func: (arg: T) => Partial<T>) =>
        modificationPipe((arg: T) => func({ ...arg, ...base(arg) })),
      after: (next: ModificationPipe<T>) =>
        modificationPipe((arg: T) => next({ ...arg, ...base(arg) })),
    }),
  );
