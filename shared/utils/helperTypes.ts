export type IfThenElse<If extends boolean, Then, Else> =
  If extends true ? Then : Else;

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
