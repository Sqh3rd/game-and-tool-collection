import { sql } from "drizzle-orm";
import { timestamp } from "drizzle-orm/pg-core";

export const timestamps = {
  updatedAt: timestamp({ mode: "date" })
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => sql`CURRENT_TIMESTAMP`),
  createdAt: timestamp({ mode: "date" }).defaultNow().notNull(),
};
