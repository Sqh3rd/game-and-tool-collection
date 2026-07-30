import { StandardSchemaV1, StandardTypedV1 } from "@standard-schema/spec";
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
export type IsNever<T> = Equals<[T], [never]>;

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
export type UnionToIntersection<A> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (A extends any ? (a: A) => void : never) extends (a: infer B) => void ? B
  : never;

export type NeverIfEmpty<T extends object> =
  [keyof T] extends [never] ? never : T;
export type RequireAnyProperty<T> =
  T extends object ?
    [keyof T] extends [never] ?
      T & "Object must not be empty"
    : T
  : T;
export type RequireAnyPropertyRecursive<T> =
  T extends object ? { [Key in keyof T]: RequireAnyPropertyRecursive<T[Key]> }
  : T;
export type Values<T extends object> = T[keyof T];
export type Narrow<T, U> = IfThenElse<Extends<T, U>, T, U>;

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

export type MergeBehaviour = "strict" | "lenient";

type GetIndices<T extends any[]> =
  keyof T extends infer Key ?
    Key extends `${infer _ extends number}` ?
      Key
    : never
  : never;

type MergeStrict<T extends object[]> =
  T extends [infer First extends object, ...infer Rest extends object[]] ?
    First & MergeStrict<Rest>
  : object;
type MergeLenient<T extends object[]> =
  GetIndices<T> extends infer Indices extends keyof T ?
    {
      [Key in keyof MergeStrict<T>]: Indices extends infer Index ?
        Index extends Indices ?
          Key extends keyof T[Index] ?
            T[Index][Key]
          : never
        : never
      : never;
    }
  : never;
export type Merge<
  T extends object[],
  Behaviour extends MergeBehaviour = "lenient",
> = IfThenElse<Equals<Behaviour, "strict">, MergeStrict<T>, MergeLenient<T>>;

export type AllKeysOf<T extends object> =
  T extends infer Entry ?
    Entry extends T ?
      keyof Entry
    : object
  : object;
export type IntersectKeysOf<T extends object> =
  (T extends object ? (a: keyof T) => void : never) extends (
    (a: infer U) => void
  ) ?
    U
  : never;
type MergeUnionStrict<T extends object> = {
  [Key in IntersectKeysOf<T> & (string | number | symbol)]: UnionToIntersection<
    T extends infer Entry ?
      Entry extends T ?
        Key extends keyof Entry ?
          Entry[Key]
        : never
      : never
    : never
  >;
};
type MergeUnionLenient<T extends object> = {
  [Key in AllKeysOf<T> & (string | number)]: T extends infer Entry ?
    Entry extends T ?
      Key extends keyof Entry ?
        Entry[Key]
      : never
    : never
  : never;
};
export type MergeUnion<
  T extends object,
  Behaviour extends MergeBehaviour = "lenient",
> = IfThenElse<
  Equals<Behaviour, "strict">,
  MergeUnionStrict<T>,
  MergeUnionLenient<T>
>;

export type MergeSchemas<
  A extends StandardSchemaV1,
  B extends StandardSchemaV1,
> = StandardSchemaV1<
  StandardTypedV1.InferOutput<A> & StandardTypedV1.InferOutput<B>
>;

export type GetKeysWhereValue<T extends object, U> =
  keyof T extends infer EKey ?
    EKey extends keyof T ?
      T[EKey] extends U ?
        EKey
      : never
    : never
  : never;

export type ForceAccess<
  T extends object,
  Key extends string | number | symbol,
> = T[Key & keyof T];
