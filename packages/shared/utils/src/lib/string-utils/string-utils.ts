import type {
  Case,
  ConvertCase,
  GetCase,
  SplitByCase,
} from "./string-utils.types";

export const getCase = <S extends string>(s: S): GetCase<S> => {
  if (s.match(/^[^_]*_/)) return "snake_case" as GetCase<S>;
  if (s.match(/^[^-]*-/)) return "kebap-case" as GetCase<S>;
  if (s.match(/^[A-Z]/)) return "PascalCase" as GetCase<S>;
  return "camelCase" as GetCase<S>;
};

export const splitByCase = <S extends string>(s: S): SplitByCase<S> => {
  const result: string[] = [];
  switch (getCase(s) as Case) {
    case "camelCase":
    case "PascalCase": {
      result.push(...splitByCapital(s));
      break;
    }
    case "kebap-case": {
      result.push(...s.split("-"));
      break;
    }
    case "snake_case": {
      result.push(...s.split("_"));
      break;
    }
  }
  return result
    .filter((it) => !!it)
    .map((it) => it.toLowerCase()) as SplitByCase<S>;
};

const splitByCapital = (s: string) => {
  const result = s.split(/[A-Z]/g);
  const matches = s.match(/[A-Z]/g);
  if (!matches) return [];
  return result.slice(1).map((it, idx) => `${matches[idx]}${it}`);
};

export const capitalize = <S extends string>(s: S): Capitalize<S> =>
  `${s.charAt(0).toUpperCase()}${s.substring(1)}` as Capitalize<S>;

export const uncapitalize = <S extends string>(s: S): Uncapitalize<S> =>
  `${s.charAt(0).toLowerCase()}${s.substring(1)}` as Uncapitalize<S>;

export const convertCase = <S extends string, Target extends Case>(
  s: S,
  target: Target,
): ConvertCase<S, Target> => {
  const currentCase = getCase(s);
  if (<Case>currentCase === target) return s as ConvertCase<S, Target>;
  const split = splitByCase(s);
  switch (target) {
    case "PascalCase":
      return split.map(capitalize).join("") as ConvertCase<S, Target>;
    case "camelCase":
      return split
        .map((it, idx) => (idx === 0 ? it : capitalize(it)))
        .join("") as ConvertCase<S, Target>;
    case "kebap-case":
      return split.join("-") as ConvertCase<S, Target>;
    case "snake_case":
      return split.join("_") as ConvertCase<S, Target>;
    default:
      throw new Error(`Invalid target case "${target}"`);
  }
};
