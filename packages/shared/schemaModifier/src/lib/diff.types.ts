export type Diff = {
  // Keys and values that were added
  added: object;
  // Keys that were removed
  removed: symbol | string | number;
  // Keys that were changed
  changed: Record<
    string | symbol | number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { before: any; after: any }
  >;
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type EmptyDiff = { added: {}; removed: never; changed: {} };

export type GetChangedKeys<Before extends object, After extends object> =
  keyof Before & keyof After extends infer Key ?
    Key extends keyof Before & keyof After ?
      Equals<After[Key & keyof After], Before[Key & keyof Before]> extends (
        true
      ) ?
        never
      : Key
    : never
  : never;
export type CreateDiff<Before extends object, After extends object> =
  Equals<Before, After> extends false ?
    {
      added: Omit<After, keyof Before>;
      removed: Exclude<keyof Before, keyof After>;
      changed: {
        [Key in GetChangedKeys<Before, After>]: {
          before: Before[Key];
          after: After[Key];
        };
      };
    }
  : EmptyDiff;

export type ApplyDiff<TSource extends object, TDiff extends Diff> = Omit<
  TSource,
  keyof TDiff["changed"] | TDiff["removed"]
>
  & TDiff["added"]
  & IfThenElse<
    UnionIsEmpty<keyof TDiff["changed"]>,
    object,
    { [Key in keyof TDiff["changed"]]: TDiff["changed"][Key]["after"] }
  >;

export type MergeDiffs<TDBefore extends Diff, TDAfter extends Diff> =
  Equals<TDBefore, EmptyDiff> extends true ? TDAfter
  : Equals<TDAfter, EmptyDiff> extends true ? TDBefore
  : {
      added: Omit<TDBefore["added"], TDAfter["removed"]> & TDAfter["added"];
      removed:
        | Exclude<TDBefore["removed"], keyof TDAfter["added"]>
        | TDAfter["removed"];
      changed: {
        [
          Key in
            | Exclude<keyof TDBefore["changed"], TDAfter["removed"]>
            | keyof TDAfter["changed"]
        ]: {
          before: Key extends keyof TDBefore["changed"] ?
            TDBefore["changed"][Key]["before"]
          : TDAfter["changed"][Key]["before"];
          after: Key extends keyof TDAfter["changed"] ?
            TDAfter["changed"][Key]["after"]
          : TDBefore["changed"][Key]["after"];
        };
      };
    };
