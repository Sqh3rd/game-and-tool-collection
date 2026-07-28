import { convertCase, getCase, splitByCase } from "./string-utils";
import { Case } from "./string-utils.types";

describe("Get Case", () => {
  test.for(<[string, Case][]>[
    ["some_snake_case_string", "snake_case"],
    ["somesnakecase_string", "snake_case"],
    ["some_", "snake_case"],
    ["_", "snake_case"],

    ["someCamelCaseString", "camelCase"],
    ["somecamelcaseS", "camelCase"],
    ["s", "camelCase"],

    ["SomePascalCaseString", "PascalCase"],
    ["Somepascalcase", "PascalCase"],
    ["S", "PascalCase"],

    ["some-kebap-case-string", "kebap-case"],
    ["somekebapcase-string", "kebap-case"],
    ["some-", "kebap-case"],
    ["-", "kebap-case"],
  ])('Case of "%s" is "%s"', ([input, expected]) => {
    expect(getCase(input)).to.eq(expected);
  });
});

describe("Split By Case", () => {
  test.for(<[string, string[]][]>[
    ["some_snake_case_string", ["some", "snake", "case", "string"]],
    ["somesnakecase_string", ["somesnakecase", "string"]],
    ["some_", ["some"]],
    ["_", []],

    ["someCamelCaseString", ["some", "camel", "case", "string"]],
    ["somecamelcaseS", ["somecamelcase", "s"]],
    ["s", ["s"]],

    ["SomePascalCaseString", ["some", "pascal", "case", "string"]],
    ["Somepascalcase", ["somepascalcase"]],
    ["S", ["s"]],

    ["some-kebap-case-string", ["some", "kebap", "case", "string"]],
    ["somekebapcase-string", ["somekebapcase", "string"]],
    ["some-", ["some"]],
    ["-", []],
  ])('Split "%s" into [%s]', ([input, expected]) => {
    expect(splitByCase(input)).to.deep.eq(expected);
  });
});

describe("Convert Case", () => {
  test.for(<[string, Case, string][]>[
    ["to_be_snake_case", "snake_case", "to_be_snake_case"],
    ["to_be_kebap_case", "kebap-case", "to-be-kebap-case"],
    ["to_be_camel_case", "camelCase", "toBeCamelCase"],
    ["to_be_pascal_case", "PascalCase", "ToBePascalCase"],

    ["to-be-snake-case", "snake_case", "to_be_snake_case"],
    ["to-be-kebap-case", "kebap-case", "to-be-kebap-case"],
    ["to-be-camel-case", "camelCase", "toBeCamelCase"],
    ["to-be-pascal-case", "PascalCase", "ToBePascalCase"],

    ["toBeSnakeCase", "snake_case", "to_be_snake_case"],
    ["toBeKebapCase", "kebap-case", "to-be-kebap-case"],
    ["toBeCamelCase", "camelCase", "toBeCamelCase"],
    ["toBePascalCase", "PascalCase", "ToBePascalCase"],

    ["ToBeSnakeCase", "snake_case", "to_be_snake_case"],
    ["ToBeKebapCase", "kebap-case", "to-be-kebap-case"],
    ["ToBeCamelCase", "camelCase", "toBeCamelCase"],
    ["ToBePascalCase", "PascalCase", "ToBePascalCase"],

    ["to_be_snake_", "snake_case", "to_be_snake"],
    ["_", "kebap-case", ""],
    ["to_be_kebap_", "snake_case", "to_be_kebap"],
    ["A", "PascalCase", "A"],
    ["A", "kebap-case", "a"],
  ])('Convert "%s" to "%s" returns "%s"', ([input, target, expected]) => {
    expect(convertCase(input, target)).to.eq(expected);
  });
});
