import { integer, varchar } from "drizzle-orm/pg-core";
import { fagrcTable } from "../../helpers/tableCreators";
import { timestamps } from "../../helpers/timestamps";

export const icon = fagrcTable("icon", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar().notNull(),
  svg: varchar().notNull().unique(),
  ...timestamps,
});
