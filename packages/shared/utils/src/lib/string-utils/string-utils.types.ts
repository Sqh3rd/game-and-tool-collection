import type { Extends, IfThenElse } from "../helper.types";

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
export type Case = "camelCase" | "PascalCase" | "kebap-case" | "snake_case";
export type GetCase<S extends string> =
  S extends `${infer _}_${infer _}` ? "snake_case" & Case
  : S extends `${infer _}-${infer _}` ? "kebap-case" & Case
  : S extends `${UpperCaseLetter}${infer _}` ? "PascalCase" & Case
  : "camelCase" & Case;

type SplitByCamelOrPascalCase<
  S extends string,
  CurrentSegment extends string = "",
> =
  S extends "" ? [Lowercase<CurrentSegment>]
  : S extends `${infer A extends UpperCaseLetter}${infer Rest}` ?
    IfThenElse<
      Extends<CurrentSegment, "">,
      SplitByCamelOrPascalCase<`${Rest}`, A>,
      [Lowercase<CurrentSegment>, ...SplitByCamelOrPascalCase<`${Rest}`, A>]
    >
  : S extends `${infer A extends UpperCaseLetter}` ?
    [Lowercase<CurrentSegment>, Lowercase<A>]
  : S extends `${infer A}${infer Rest}` ?
    SplitByCamelOrPascalCase<Rest, `${CurrentSegment}${A}`>
  : [];

type SplitByKebapCase<S extends string> =
  S extends `${infer A}-${infer Rest}` ?
    [Lowercase<A>, ...SplitByKebapCase<Rest>]
  : [Lowercase<S>];

type SplitBySnakeCase<S extends string> =
  S extends `${infer A}_${infer B}` ? [Lowercase<A>, ...SplitBySnakeCase<B>]
  : [Lowercase<S>];

type RemoveEmptyStrings<T extends string[]> =
  T extends [infer A extends string, ...infer Rest extends string[]] ?
    A extends "" ?
      RemoveEmptyStrings<Rest>
    : [A, ...RemoveEmptyStrings<Rest>]
  : T extends [infer A extends string] ?
    A extends "" ?
      []
    : [A]
  : [];

type InternalSplitByCase<S extends string, Source extends Case = GetCase<S>> =
  Source extends "camelCase" | "PascalCase" ? SplitByCamelOrPascalCase<S>
  : Source extends "kebap-case" ? SplitByKebapCase<S>
  : Source extends "snake_case" ? SplitBySnakeCase<S>
  : [];

export type SplitByCase<
  S extends string,
  Source extends Case = GetCase<S>,
> = RemoveEmptyStrings<InternalSplitByCase<S, Source>>;

type TupleToCamelCase<S extends string[]> =
  `${S[0]}${TupleToPascalCase<S, [0]>}`;
type TupleToPascalCase<S extends string[], CurrentIndex extends number[] = []> =
  CurrentIndex["length"] extends S["length"] ? ""
  : `${Capitalize<S[CurrentIndex["length"]]>}${TupleToPascalCase<S, [...CurrentIndex, 0]>}`;
type TupleToSeparatedString<
  S extends string[],
  Separator extends string,
  CurrentIndex extends number[] = [],
> =
  CurrentIndex["length"] extends S["length"] ? ""
  : `${S[CurrentIndex["length"]]}${[...CurrentIndex, 0]["length"] extends S["length"] ? "" : Separator}${TupleToSeparatedString<S, Separator, [...CurrentIndex, 0]>}`;
type TupleToKebapCase<S extends string[]> = TupleToSeparatedString<S, "-">;
type TupleToSnakeCase<S extends string[]> = TupleToSeparatedString<S, "_">;
export type ToCase<S extends string[], Target extends Case> =
  Target extends "camelCase" ? TupleToCamelCase<S>
  : Target extends "PascalCase" ? TupleToPascalCase<S>
  : Target extends "kebap-case" ? TupleToKebapCase<S>
  : Target extends "snake_case" ? TupleToSnakeCase<S>
  : never;

export type ConvertCase<
  S extends string,
  Target extends Case,
  Source extends Case = GetCase<S>,
> = Target extends Source ? S : ToCase<SplitByCase<S, Source>, Target>;
