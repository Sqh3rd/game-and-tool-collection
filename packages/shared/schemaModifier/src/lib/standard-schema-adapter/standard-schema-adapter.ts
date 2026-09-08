import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-orm/zod";
import * as z from "zod";
import { StandardSchemaAdapters } from "./standard-schema-adapter.types";

export const standardSchemaAdapters: StandardSchemaAdapters = {
  zod: {
    optional: (it) => z.optional(it as z.ZodType),
    array: (it) => z.array(it as z.ZodType),

    createBaseSchemaGroup: (table) => ({
      insert: createInsertSchema(table),
      select: createSelectSchema(table),
      update: createUpdateSchema(table),
    }),
  },
};
