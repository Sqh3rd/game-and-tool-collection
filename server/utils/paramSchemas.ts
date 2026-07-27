import * as z from "zod";

const stringToNumber = (it: unknown) => {
  if (typeof it !== "string") return -1;
  return Number.parseInt(it);
};

export const singularIdParamSchema = <Name extends string>(name: Name) =>
  z.object({ [name]: z.preprocess(stringToNumber, z.number().nonnegative()) });
