import * as z from "zod";

export const singularIdParamSchema = <Name extends string>(name: Name) =>
  z.object({ [name]: z.number().nonnegative() });
