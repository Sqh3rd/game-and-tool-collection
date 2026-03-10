export type IfThenElse<If extends boolean, Then, Else> =
  If extends true ? Then : Else;

export type Not<A extends boolean> = IfThenElse<A, false, true>;

export type Extends<A, B> = A extends B ? true : false;
export type Equals<A, B> =
  A extends B ?
    B extends A ?
      true
    : false
  : false;

/**
 * Assumes both A and B are unions.
 *
 * @returns
 * true - if all entries of B are contained in A. (A is superset of B)
 *
 * false - if no entries of B are contained in A.
 *
 * boolean - if some entries of B are contained in A.
 */
type AnyOverlap<A, B> = B extends infer Entry ? Extends<Entry, A> : never;
export type Includes<A, B> = AnyOverlap<A, B> extends false ? false : true;

export type UnionIsEmpty<A> = [A] extends [never] ? true : false;
export type UnionHasEntries<A> = Not<UnionIsEmpty<A>>;

export type TryAccess<
  Key extends string | number | symbol,
  Obj extends object,
> = Key extends keyof Obj ? Obj[Key] : never;

export type RemovePrefix<
  S extends string,
  Prefix extends string,
  Fallback = S,
> = S extends `${Prefix}${infer Rest}` ? Rest : Fallback;

export type WithPrefix<
  S extends string,
  Prefix extends string,
  CapitalizeS extends boolean = true,
> = `${Prefix}${IfThenElse<CapitalizeS, Capitalize<S>, S>}`;

export type Guard<
  Condition extends boolean,
  GuardStatement extends string,
  T,
> = IfThenElse<Condition, GuardStatement & T, T>;

export type SimpleTypes = {
  bigint: bigint;
  boolean: boolean;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  function: Function;
  number: number;
  object: object;
  string: string;
  symbol: symbol;
  undefined: undefined;
};

export type GetNameOfSimpleType<T extends SimpleTypes[keyof SimpleTypes]> =
  keyof SimpleTypes extends infer Key ?
    Key extends keyof SimpleTypes ?
      T extends SimpleTypes[Key] ?
        Key
      : never
    : never
  : never;

export type GetSimpleTypeFromName<T extends keyof SimpleTypes> = SimpleTypes[T];
