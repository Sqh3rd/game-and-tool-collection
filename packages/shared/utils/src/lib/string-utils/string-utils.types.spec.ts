import { convertCase } from "./string-utils";

describe("Types work", () => {
  it("infers conversion types", () => {
    const camelCaseString = "someCamelCaseString";
    expectTypeOf(
      convertCase(camelCaseString, "kebap-case"),
    ).toEqualTypeOf<"some-camel-case-string">();
    // test
  });
});
