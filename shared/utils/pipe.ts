import { identity } from "./helperFunctions";

export interface Pipe<In, Out> {
  (arg: In): Out;

  func: <T>(func: (arg: Out) => T) => Pipe<In, T>;
  after: <T>(pipe: Pipe<Out, T>) => Pipe<In, T>;
}

export const pipe = <In, Out>(it: (arg: In) => Out): Pipe<In, Out> =>
  Object.assign((arg: In) => it(arg), {
    func: <T>(func: (arg: Out) => T) => pipe((arg: In) => func(it(arg))),
    after: <T>(next: Pipe<Out, T>) => pipe((arg: In) => next(it(arg))),
  });

export interface ModificationPipe<T> {
  (arg: T): T;

  func: (func: (arg: T) => Partial<T>) => ModificationPipe<T>;
  after: (pipe: ModificationPipe<T>) => ModificationPipe<T>;
}

export const modificationPipe = <T>(
  it: (arg: T) => Partial<T> = identity,
): ModificationPipe<T> =>
  Object.assign((arg: T) => <T>{ ...arg, ...it(arg) }, {
    func: (func: (arg: T) => Partial<T>) =>
      modificationPipe((arg: T) => func({ ...arg, ...it(arg) })),
    after: (next: ModificationPipe<T>) =>
      modificationPipe((arg: T) => next({ ...arg, ...it(arg) })),
  });
