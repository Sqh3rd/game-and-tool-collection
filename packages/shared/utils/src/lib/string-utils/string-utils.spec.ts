import { getCase, splitByCase } from "./string-utils";
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
