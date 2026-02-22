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
> = IfThenElse<Condition, GuardStatement & T, T>;

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

type SplitByCamelOrPascalCase<
  S extends string,
  CurrentSegment extends string = "",
> =
  S extends "" ? [Lowercase<CurrentSegment>]
  : S extends (
    `${infer A extends UpperCaseLetter}${infer B extends LowerCaseLetter}${infer Rest}`
  ) ?
    IfThenElse<
      Extends<CurrentSegment, "">,
      SplitByCamelOrPascalCase<`${B}${Rest}`, A>,
      [Lowercase<CurrentSegment>, ...SplitByCamelOrPascalCase<`${B}${Rest}`, A>]
    >
  : S extends (
    `${infer A extends LowerCaseLetter}${infer B extends UpperCaseLetter}`
  ) ?
    [Lowercase<`${CurrentSegment}${A}`>, Lowercase<B>]
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

const getCase = <S extends string>(s: S): GetCase<S> => {
  if (s.match(/^[^_]+_/)) return "snake_case" as GetCase<S>;
  if (s.match(/^[^-]+-/)) return "kebap-case" as GetCase<S>;
  if (s.match(/^[A-Z]/)) return "PascalCase" as GetCase<S>;
  return "camelCase" as GetCase<S>;
};

const snake_case = getCase("snake_case");
const kebapCase = getCase("kebap-case");
const PascalCase = getCase("PascalCase");
const camelCase = getCase("camelCase");

const splitByCase = <S extends string>(s: S): SplitByCase<S> => {
  const result: string[] = [];
  let sectionStart = 0;
  switch (getCase(s) as Case) {
    case "camelCase":
    case "PascalCase": {
      let wasLastUpper = false;
      for (let i = 1; i < s.length - 1; i++) {
        const currentChar = s.charAt(i);
        if (currentChar.match(/[a-z]/)) {
          if (wasLastUpper) {
            result.push(s.substring(sectionStart, i - 1).toLowerCase());
            sectionStart = i - 1;
          }
          wasLastUpper = false;
        } else if (currentChar.match(/[A-Z]/)) {
          wasLastUpper = true;
        }
      }
      if (!wasLastUpper && s.charAt(s.length - 1).match(/[a-z]/)) {
        result.push(s.substring(sectionStart, s.length - 1).toLowerCase());
        sectionStart = s.length - 1;
      }
      result.push(s.substring(sectionStart, s.length).toLowerCase());

      break;
    }
    case "kebap-case": {
      for (let i = 0; i < s.length; i++) {
        const currentChar = s.charAt(i);
        if (currentChar != "-") continue;
        result.push(s.substring(sectionStart, i).toLowerCase());
        sectionStart = i + 1;
      }
      break;
    }
    case "snake_case": {
      for (let i = 0; i < s.length; i++) {
        const currentChar = s.charAt(i);
        if (currentChar != "_") continue;
        result.push(s.substring(sectionStart, i).toLowerCase());
        sectionStart = i + 1;
      }
      break;
    }
  }
  return result.filter((it) => !!it) as SplitByCase<S>;
};

const splitCamelCase = splitByCase("camelCasE");

const convertCase = <S extends string, Target extends Case>(
  s: S,
  target: Target,
): ConvertCase<S, Target> => ({});

const test = convertCase("somethingInCamelCase", "kebap-case");
