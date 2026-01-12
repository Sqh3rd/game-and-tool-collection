import { integer, numeric, pgTable } from "drizzle-orm/pg-core";
import { timestamps } from "../../helpers/timestamps";

export const recipe = pgTable("fagrc_recipe", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  duration: numeric(),
  ...timestamps,
});
