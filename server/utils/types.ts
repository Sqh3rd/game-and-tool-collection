import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-orm/zod";
import {
  junctionProcessableRecipe,
  junctionProcessorRecipe,
} from "hub:db:schema";
import type * as z from "zod";
import { timestampMask } from "~~/shared/types/db/helpers";

export namespace JunctionProcessableRecipe {
  export const selectSchema = createSelectSchema(junctionProcessableRecipe);
  export type Select = z.infer<typeof selectSchema>;

  export const insertSchema = createInsertSchema(
    junctionProcessableRecipe,
  ).omit(timestampMask);
  export type Insert = z.infer<typeof insertSchema>;

  export const updateSchema = createUpdateSchema(
    junctionProcessableRecipe,
  ).omit(timestampMask);
  export type Update = z.infer<typeof updateSchema>;
}

export namespace JunctionProcessorRecipe {
  export const selectSchema = createSelectSchema(junctionProcessorRecipe);
  export type Select = z.infer<typeof selectSchema>;

  export const insertSchema = createInsertSchema(junctionProcessorRecipe).omit(
    timestampMask,
  );
  export type Insert = z.infer<typeof insertSchema>;

  export const updateSchema = createUpdateSchema(junctionProcessorRecipe).omit(
    timestampMask,
  );
  export type Update = z.infer<typeof updateSchema>;
}
