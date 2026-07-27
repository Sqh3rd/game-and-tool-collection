import { index, integer, snakeCase, real } from "drizzle-orm/pg-core";
import { icon, mod } from ".";
import { timestamps } from "../../helpers/timestamps";

export const recipe = snakeCase.table(
  "fagrc_recipe",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    duration: real(),
    iconId: integer().references(() => icon.id),
    modId: integer().references(() => mod.id),
    ...timestamps,
  },
  (t) => [index().on(t.modId)],
);
