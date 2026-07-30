import {
  ConvertCase,
  GetCase,
  SplitByCase,
  ToCase,
} from "./string-utils.types";

describe("Get case", () => {
  test("camelCase", () => {
    expectTypeOf<GetCase<"camelCase">>().toEqualTypeOf<"camelCase">();
    expectTypeOf<GetCase<"cC">>().toEqualTypeOf<"camelCase">();
  });
  test("PascalCase", () => {
    expectTypeOf<GetCase<"PascalCase">>().toEqualTypeOf<"PascalCase">();
    expectTypeOf<GetCase<"PC">>().toEqualTypeOf<"PascalCase">();
  });
  test("kebap-case", () => {
    expectTypeOf<GetCase<"kebap-case">>().toEqualTypeOf<"kebap-case">();
    expectTypeOf<GetCase<"-">>().toEqualTypeOf<"kebap-case">();
    expectTypeOf<GetCase<"kEbAp-CaSe">>().toEqualTypeOf<"kebap-case">();
  });
  test("snake_case", () => {
    expectTypeOf<GetCase<"snake_case">>().toEqualTypeOf<"snake_case">();
    expectTypeOf<GetCase<"_">>().toEqualTypeOf<"snake_case">();
    expectTypeOf<GetCase<"sNa-Ke_CaSe">>().toEqualTypeOf<"snake_case">();
  });
});

describe("Split by case", () => {
  test("camelCase", () => {
    expectTypeOf<SplitByCase<"camelCase">>().toEqualTypeOf<["camel", "case"]>();
    expectTypeOf<SplitByCase<"cC">>().toEqualTypeOf<["c", "c"]>();
  });
  test("PascalCase", () => {
    expectTypeOf<SplitByCase<"PascalCase">>().toEqualTypeOf<
      ["pascal", "case"]
    >();
    expectTypeOf<SplitByCase<"PC">>().toEqualTypeOf<["p", "c"]>();
  });
  test("kebap-case", () => {
    expectTypeOf<SplitByCase<"kebap-case">>().toEqualTypeOf<
      ["kebap", "case"]
    >();
    expectTypeOf<SplitByCase<"-">>().toEqualTypeOf<[]>();
    expectTypeOf<SplitByCase<"kEbAp-CaSe">>().toEqualTypeOf<
      ["kebap", "case"]
    >();
  });
  test("snake_case", () => {
    expectTypeOf<SplitByCase<"snake_case">>().toEqualTypeOf<
      ["snake", "case"]
    >();
    expectTypeOf<SplitByCase<"_">>().toEqualTypeOf<[]>();
    expectTypeOf<SplitByCase<"sNa-Ke_CaSe">>().toEqualTypeOf<
      ["sna-ke", "case"]
    >();
  });
});

describe("To case", () => {
  test("camelCase", () => {
    expectTypeOf<
      ToCase<["camel", "case"], "camelCase">
    >().toEqualTypeOf<"camelCase">();
    expectTypeOf<ToCase<["c", "c"], "camelCase">>().toEqualTypeOf<"cC">();
  });
  test("PascalCase", () => {
    expectTypeOf<
      ToCase<["pascal", "case"], "PascalCase">
    >().toEqualTypeOf<"PascalCase">();
    expectTypeOf<ToCase<["p", "c"], "PascalCase">>().toEqualTypeOf<"PC">();
  });
  test("kebap-case", () => {
    expectTypeOf<
      ToCase<["kebap", "case"], "kebap-case">
    >().toEqualTypeOf<"kebap-case">();
    expectTypeOf<ToCase<[], "kebap-case">>().toEqualTypeOf<"">();
    expectTypeOf<
      ToCase<["kebap", "case"], "kebap-case">
    >().toEqualTypeOf<"kebap-case">();
  });
  test("snake_case", () => {
    expectTypeOf<
      ToCase<["snake", "case"], "snake_case">
    >().toEqualTypeOf<"snake_case">();
    expectTypeOf<ToCase<[], "snake_case">>().toEqualTypeOf<"">();
    expectTypeOf<
      ToCase<["sna-ke", "case"], "snake_case">
    >().toEqualTypeOf<"sna-ke_case">();
  });
});

describe("Convert case", () => {
  test("convert to camelCase", () => {
    expectTypeOf<
      ConvertCase<"test-kebap", "camelCase">
    >().toEqualTypeOf<"testKebap">();
    expectTypeOf<
      ConvertCase<"test_snake", "camelCase">
    >().toEqualTypeOf<"testSnake">();
    expectTypeOf<
      ConvertCase<"testCamel", "camelCase">
    >().toEqualTypeOf<"testCamel">();
    expectTypeOf<
      ConvertCase<"TestPascal", "camelCase">
    >().toEqualTypeOf<"testPascal">();
  });
  test("PascalCase", () => {
    expectTypeOf<
      ConvertCase<"test-kebap", "PascalCase">
    >().toEqualTypeOf<"TestKebap">();
    expectTypeOf<
      ConvertCase<"test_snake", "PascalCase">
    >().toEqualTypeOf<"TestSnake">();
    expectTypeOf<
      ConvertCase<"testCamel", "PascalCase">
    >().toEqualTypeOf<"TestCamel">();
    expectTypeOf<
      ConvertCase<"TestPascal", "PascalCase">
    >().toEqualTypeOf<"TestPascal">();
  });
  test("kebap-case", () => {
    expectTypeOf<
      ConvertCase<"test-kebap", "kebap-case">
    >().toEqualTypeOf<"test-kebap">();
    expectTypeOf<
      ConvertCase<"test_snake", "kebap-case">
    >().toEqualTypeOf<"test-snake">();
    expectTypeOf<
      ConvertCase<"testCamel", "kebap-case">
    >().toEqualTypeOf<"test-camel">();
    expectTypeOf<
      ConvertCase<"TestPascal", "kebap-case">
    >().toEqualTypeOf<"test-pascal">();
  });
  test("snake_case", () => {
    expectTypeOf<
      ConvertCase<"test-kebap", "snake_case">
    >().toEqualTypeOf<"test_kebap">();
    expectTypeOf<
      ConvertCase<"test_snake", "snake_case">
    >().toEqualTypeOf<"test_snake">();
    expectTypeOf<
      ConvertCase<"testCamel", "snake_case">
    >().toEqualTypeOf<"test_camel">();
    expectTypeOf<
      ConvertCase<"TestPascal", "snake_case">
    >().toEqualTypeOf<"test_pascal">();
  });
});
