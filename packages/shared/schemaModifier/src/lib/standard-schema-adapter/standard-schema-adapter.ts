import * as dz from "drizzle-orm/zod";
import * as dv from "drizzle-orm/valibot";
import * as z from "zod";
import * as v from "valibot";
import {
  BaseValues,
  StandardSchemaAdapters,
} from "./standard-schema-adapter.types";

export const standardSchemaAdapters: StandardSchemaAdapters = {
  valibot: {
    optional: (it) => v.optional(it as BaseValues["valibot"]["Base"]),
    array: (it) => v.array(it as BaseValues["valibot"]["Base"]),

    createBaseSchemaGroup: (table) => ({
      insert: dv.createInsertSchema(table),
      select: dv.createSelectSchema(table),
      update: dv.createUpdateSchema(table),
    }),
  },
  zod: {
    optional: (it) => z.optional(it as BaseValues["zod"]["Base"]),
    array: (it) => z.array(it as BaseValues["zod"]["Base"]),

    createBaseSchemaGroup: (table) => ({
      insert: dz.createInsertSchema(table),
      select: dz.createSelectSchema(table),
      update: dz.createUpdateSchema(table),
    }),
  },
};
