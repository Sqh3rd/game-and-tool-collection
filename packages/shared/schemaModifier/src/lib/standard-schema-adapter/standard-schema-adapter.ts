import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-orm/zod";
import * as z from "zod";
import { StandardSchemaAdapter } from "./standard-schema-adapter.types";

export const standardSchemaAdapters = {
  zod: (): StandardSchemaAdapter<z.ZodType, z.ZodObject> => ({
    optional: (it) => z.optional(it),
    array: (it) => z.array(it),

    createBaseSchemaGroup: (table) => ({
      insert: createInsertSchema(table),
      select: createSelectSchema(table),
      update: createUpdateSchema(table),
    }),
  }),
};
