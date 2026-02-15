import { integer, pgTable, real } from "drizzle-orm/pg-core";
import { timestamps } from "../../helpers/timestamps";

export const recipe = pgTable("fagrc_recipe", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  duration: real(),
  ...timestamps,
});
