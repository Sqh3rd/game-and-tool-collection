import { Equals, IsNever } from "./helper.types";

export type Ctor<Params extends any[], Class> = new (...args: Params) => Class;

type Builder<Params extends object, Result extends object> = {
  [key in keyof Params]: (val: Params[key]) => Builder<Params, Result>;
} & { build: () => Result };

type OneTimeBuilder<Params extends object, Result extends object> =
  Equals<Params, {}> extends true ? { build: () => Result }
  : {
      [key in keyof Params]: (
        val: Params[key],
      ) => OneTimeBuilder<Omit<Params, key>, Result>;
    };
