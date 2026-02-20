export type IfThenElse<If extends boolean, Then, Else> =
  If extends true ? Then : Else;

export type Not<A extends boolean> = IfThenElse<A, false, true>;

export type Extends<A, B> = A extends B ? true : false;

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
> = IfThenElse<Condition, T & GuardStatement, T>;

type UpperCaseLetter =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "O"
  | "P"
  | "Q"
  | "R"
  | "S"
  | "T"
  | "U"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z";
type LowerCaseLetter = Lowercase<UpperCaseLetter>;
export type Case = "camelCase" | "PascalCase" | "kebap-case" | "snake_case";
export type GetCase<S extends string> =
  S extends `${infer _}_${infer _}` ? "snake_case" & Case
  : S extends `${infer _}-${infer _}` ? "kebap-case" & Case
  : S extends `${UpperCaseLetter}${infer _}` ? "PascalCase" & Case
  : "camelCase" & Case;

type SplitByCamelOrPascalCase<S extends string> =
  S extends (
    `${infer A}${infer UCL extends UpperCaseLetter}${infer LCL extends LowerCaseLetter}${infer Rest}`
  ) ?
    [Lowercase<A>, ...SplitByCamelOrPascalCase<`${UCL}${LCL}${Rest}`>]
  : S extends (
    `${infer A}${infer LCL extends LowerCaseLetter}${infer UCL extends UpperCaseLetter}`
  ) ?
    [Lowercase<`${A}${LCL}`>, Lowercase<UCL>]
  : [Lowercase<S>];

type SplitByKebapCase<S extends string> =
  S extends `${infer A}-${infer Rest}` ?
    [Lowercase<A>, ...SplitByKebapCase<Rest>]
  : [Lowercase<S>];

type SplitBySnakeCase<S extends string> =
  S extends `${infer A}_${infer B}` ? [Lowercase<A>, ...SplitBySnakeCase<B>]
  : [Lowercase<S>];

type SplitByCase<S extends string, Source extends Case = GetCase<S>> =
  Source extends "camelCase" | "PascalCase" ? SplitByCamelOrPascalCase<S>
  : Source extends "kebap-case" ? SplitByKebapCase<S>
  : Source extends "snake_case" ? SplitBySnakeCase<S>
  : [];

type TupelToCamelCase<S extends string[]> =
  `${S[0]}${TupelToPascalCase<S, [0]>}`;
type TupelToPascalCase<S extends string[], CurrentIndex extends number[] = []> =
  CurrentIndex["length"] extends S["length"] ? ""
  : `${Capitalize<S[CurrentIndex["length"]]>}${TupelToPascalCase<S, [...CurrentIndex, 0]>}`;
type TupelToSeparatedString<
  S extends string[],
  Separator extends string,
  CurrentIndex extends number[] = [],
> =
  CurrentIndex["length"] extends S["length"] ? ""
  : `${S[CurrentIndex["length"]]}${[...CurrentIndex, 0]["length"] extends S["length"] ? "" : Separator}${TupelToSeparatedString<S, Separator, [...CurrentIndex, 0]>}`;
type TupelToKebapCase<S extends string[]> = TupelToSeparatedString<S, "-">;
type TupelToSnakeCase<S extends string[]> = TupelToSeparatedString<S, "_">;
type ToCase<S extends string[], Target extends Case> =
  Target extends "camelCase" ? TupelToCamelCase<S>
  : Target extends "PascalCase" ? TupelToPascalCase<S>
  : Target extends "kebap-case" ? TupelToKebapCase<S>
  : Target extends "snake_case" ? TupelToSnakeCase<S>
  : never;

export type ConvertCase<
  S extends string,
  Target extends Case,
  Source extends Case = GetCase<S>,
> = Target extends Source ? S : ToCase<SplitByCase<S, Source>, Target>;
