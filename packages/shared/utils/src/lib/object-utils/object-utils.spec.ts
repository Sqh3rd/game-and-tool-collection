import { createCallableObject, merge } from "./object-utils";

describe("merge", () => {
  test.for(<
    {
      name: string;
      input: [Record<string, number>, Record<string, number>];
      result: object;
    }[]
  >[
    {
      name: "Same object twice",
      input: [
        { a: 0, b: 1 },
        { a: 0, b: 1 },
      ],
      result: { a: 0, b: 2 },
    },
    {
      name: "Different objects, same properties",
      input: [
        { a: 0, b: 1 },
        { a: 10, b: 11 },
      ],
      result: { a: 10, b: 12 },
    },
    {
      name: "Different objects, overlapping properties",
      input: [
        { a: 0, b: 1 },
        { b: 11, c: 12 },
      ],
      result: { a: 0, b: 12, c: 12 },
    },
    {
      name: "Different objects, different properties",
      input: [
        { a: 0, b: 1 },
        { c: 12, d: 13 },
      ],
      result: { a: 0, b: 1, c: 12, d: 13 },
    },
  ])("Custom: $name", ({ input, result }) => {
    expect(merge(input[0], input[1], (a, b) => a + b)).to.deep.eq(result);
  });

  test.for(<
    {
      name: string;
      input: [Record<string, number>, Record<string, number>];
      result: object;
    }[]
  >[
    {
      name: "Same object twice",
      input: [
        { a: 0, b: 1 },
        { a: 0, b: 1 },
      ],
      result: { a: [0, 0], b: [1, 1] },
    },
    {
      name: "Different objects, same properties",
      input: [
        { a: 0, b: 1 },
        { a: 10, b: 11 },
      ],
      result: { a: [0, 10], b: [1, 11] },
    },
    {
      name: "Different objects, overlapping properties",
      input: [
        { a: 0, b: 1 },
        { b: 11, c: 12 },
      ],
      result: { a: 0, b: [1, 11], c: 12 },
    },
    {
      name: "Different objects, different properties",
      input: [
        { a: 0, b: 1 },
        { c: 12, d: 13 },
      ],
      result: { a: 0, b: 1, c: 12, d: 13 },
    },
  ])("Concat: $name", ({ input, result }) => {
    expect(merge.concat(input[0], input[1])).to.deep.eq(result);
  });

  test.for(<
    {
      name: string;
      input: [Record<string, number[]>, Record<string, number[]>];
      result: object;
    }[]
  >[
    {
      name: "Same object twice",
      input: [
        { a: [0], b: [1] },
        { a: [0], b: [1] },
      ],
      result: { a: [0, 0], b: [1, 1] },
    },
    {
      name: "Different objects, same properties",
      input: [
        { a: [0], b: [1] },
        { a: [10], b: [11] },
      ],
      result: { a: [0, 10], b: [1, 11] },
    },
    {
      name: "Different objects, overlapping properties",
      input: [
        { a: [0], b: [1] },
        { b: [11], c: [12] },
      ],
      result: { a: [0], b: [1, 11], c: [12] },
    },
    {
      name: "Different objects, different properties",
      input: [
        { a: [0], b: [1] },
        { c: [12], d: [13] },
      ],
      result: { a: [0], b: [1], c: [12], d: [13] },
    },
  ])("Concat.flat: $name", ({ input, result }) => {
    expect(merge.concat.flat(input[0], input[1])).to.deep.eq(result);
  });
});

test("Create callable object", () => {
  const callable = createCallableObject(
    () => "test",
    (_) => ({
      someProp: 0,
      inner: createCallableObject(
        (a: string, b: string) => `${a} ${b}`,
        (base) => ({
          someOtherProp: "test",
          hello: (name: string) => base("hello", name),
        }),
      ),
    }),
  );
  expect(callable()).to.eq("test");
  expect(callable.someProp).to.eq(0);
  expect(callable.inner("a", "b")).to.eq("a b");
  expect(callable.inner.someOtherProp).to.eq("test");
  expect(callable.inner.hello("world")).to.eq("hello world");

  expect(Object.keys(callable)).to.deep.eq(["someProp", "inner"]);
});
