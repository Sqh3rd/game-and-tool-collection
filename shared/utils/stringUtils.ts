import type {
    Case,
    ConvertCase,
    GetCase,
    SplitByCase,
} from "./stringUtils.types";

export const getCase = <S extends string>(s: S): GetCase<S> => {
  if (s.match(/^[^_]+_/)) return "snake_case" as GetCase<S>;
  if (s.match(/^[^-]+-/)) return "kebap-case" as GetCase<S>;
  if (s.match(/^[A-Z]/)) return "PascalCase" as GetCase<S>;
  return "camelCase" as GetCase<S>;
};

const snake_case = getCase("snake_case");
const kebapCase = getCase("kebap-case");
const PascalCase = getCase("PascalCase");
const camelCase = getCase("camelCase");

export const splitByCase = <S extends string>(s: S): SplitByCase<S> => {
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
        result.push(...s.split("-"));
      break;
    }
    case "snake_case": {
      result.push(...s.split("_"));
      break;
    }
  }
  return result.filter((it) => !!it) as SplitByCase<S>;
};

const splitCamelCase = splitByCase("camelCasE");

const capitalize = <S extends string>(s: S): Capitalize<S> =>
  `${s.charAt(0).toUpperCase()}${s.substring(1)}` as Capitalize<S>;
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

const test = convertCase("somethingInCamelCase", "snake_case");
