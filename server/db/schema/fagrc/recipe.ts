import { integer, pgTable, real } from "drizzle-orm/pg-core";
import { icon } from ".";
import { timestamps } from "../../helpers/timestamps";

export const recipe = pgTable("fagrc_recipe", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  duration: real(),
  iconId: integer().references(() => icon.id),
  ...timestamps,
});
