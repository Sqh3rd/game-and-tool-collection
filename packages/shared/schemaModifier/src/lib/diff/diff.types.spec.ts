import type {
  ApplyDiff,
  CreateDiff,
  EmptyDiff,
  MergeDiffs,
} from "./diff.types";

describe("Create Diff", () => {
  test("No change", () => {
    expectTypeOf<
      CreateDiff<{ a: string }, { a: string }>
    >().toEqualTypeOf<EmptyDiff>();
    expectTypeOf<
      CreateDiff<{ a?: string }, { a?: string }>
    >().toEqualTypeOf<EmptyDiff>();
    expectTypeOf<
      CreateDiff<{ a: string | number }, { a: string | number }>
    >().toEqualTypeOf<EmptyDiff>();
  });

  test("Property changed", () => {
    expectTypeOf<CreateDiff<{ a: string }, { a: number }>>().toEqualTypeOf<{
      added: {};
      removed: never;
      changed: { a: { before: string; after: number } };
    }>();
    expectTypeOf<CreateDiff<{ a?: string }, { a?: number }>>().toEqualTypeOf<{
      added: {};
      removed: never;
      changed: { a: { before: string | undefined; after: number | undefined } };
    }>();
    expectTypeOf<CreateDiff<{ a?: string }, { a: string }>>().toEqualTypeOf<{
      added: {};
      removed: never;
      changed: { a: { before: string | undefined; after: string } };
    }>();
  });

  test("Property removed", () => {
    expectTypeOf<CreateDiff<{ a: string }, {}>>().toEqualTypeOf<{
      added: {};
      removed: "a";
      changed: {};
    }>();
    expectTypeOf<CreateDiff<{ a?: string }, {}>>().toEqualTypeOf<{
      added: {};
      removed: "a";
      changed: {};
    }>();
    expectTypeOf<
      CreateDiff<{ a: string; b: number }, { b: number }>
    >().toEqualTypeOf<{ added: {}; removed: "a"; changed: {} }>();
    expectTypeOf<
      CreateDiff<{ a?: string; b?: number }, { b?: number }>
    >().toEqualTypeOf<{ added: {}; removed: "a"; changed: {} }>();
  });
  test("Property added", () => {
    expectTypeOf<CreateDiff<{}, { a: string }>>().toEqualTypeOf<{
      added: { a: string };
      removed: never;
      changed: {};
    }>();
    expectTypeOf<CreateDiff<{}, { a?: string }>>().toEqualTypeOf<{
      added: { a?: string | undefined };
      removed: never;
      changed: {};
    }>();
  });

  test("Multiple changes", () =>
    expectTypeOf<
      CreateDiff<{ a: string; b: number }, { a?: number; c: string }>
    >().toEqualTypeOf<{
      added: { c: string };
      removed: "b";
      changed: { a: { before: string; after: number | undefined } };
    }>());
});

describe("Merge Diff", () => {
  test("Merge empty Diffs", () =>
    expectTypeOf<
      MergeDiffs<EmptyDiff, EmptyDiff>
    >().toEqualTypeOf<EmptyDiff>());
  test("Merge non empty with empty Diff", () => {
    type TestDiff = CreateDiff<{ a: string }, {}>;
    expectTypeOf<MergeDiffs<TestDiff, EmptyDiff>>().toEqualTypeOf<TestDiff>();
    expectTypeOf<MergeDiffs<EmptyDiff, TestDiff>>().toEqualTypeOf<TestDiff>();
  });
  test("Merge identical diffs", () => {
    type TestDiff = CreateDiff<{ a: string }, {}>;
    expectTypeOf<MergeDiffs<TestDiff, TestDiff>>().toEqualTypeOf<{
      added: {};
      removed: "a";
      changed: {};
    }>();
  });
  test("Merge different diffs", () => {
    type Args = [
      [CreateDiff<{ a: string }, {}>, CreateDiff<{}, { a: string }>, EmptyDiff],
      [CreateDiff<{}, { a: string }>, CreateDiff<{ a: string }, {}>, EmptyDiff],
      [
        CreateDiff<{ a: string }, {}>,
        CreateDiff<{}, { b: number }>,
        CreateDiff<{ a: string }, { b: number }>,
      ],
      [
        CreateDiff<{}, { a?: string }>,
        CreateDiff<{ b: string }, { b?: string }>,
        CreateDiff<{ b: string }, { a?: string; b?: string }>,
      ],
    ];
    type Actual<N extends keyof Args & number> = MergeDiffs<
      Args[N][0],
      Args[N][1]
    >;
    type Expected<N extends keyof Args & number> = Args[N][2];
    expectTypeOf<Actual<0>>().toEqualTypeOf<Expected<0>>();
    expectTypeOf<Actual<1>>().toEqualTypeOf<Expected<1>>();
    expectTypeOf<Actual<2>>().toEqualTypeOf<Expected<2>>();
    expectTypeOf<Actual<3>>().toEqualTypeOf<Expected<3>>();
    type T = Actual<3>;
  });
});

describe("Apply Diff", () => {
  test("Apply empty diff", () =>
    expectTypeOf<ApplyDiff<{ a: string }, EmptyDiff>>().toEqualTypeOf<{
      a: string;
    }>());
  test("Apply non-empty diff", () => {
    type Args = [
      [{}, CreateDiff<{}, { a: string }>, { a: string }],
      [{ a: string; b: number }, CreateDiff<{ a: string }, {}>, { b: number }],
      [{ a: string }, CreateDiff<{ a: string }, { a: number }>, { a: number }],
      [
        { a: string; b: number },
        CreateDiff<{ a: string; b: number }, { a: number; c: string }>,
        { a: number; c: string },
      ],
    ];
    type Actual<N extends keyof Args & number> = ApplyDiff<
      Args[N][0],
      Args[N][1]
    >;
    type Expected<N extends keyof Args & number> = Args[N][2];
    expectTypeOf<Actual<0>>().toEqualTypeOf<Expected<0>>();
    expectTypeOf<Actual<1>>().toEqualTypeOf<Expected<1>>();
    expectTypeOf<Actual<2>>().toEqualTypeOf<Expected<2>>();
  });
});
