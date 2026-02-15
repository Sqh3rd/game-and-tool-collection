import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-orm/zod";
import { game, mod, processable, processor, recipe } from "hub:db:schema";
import type * as z from "zod";
import { timestampMask } from "./helpers";

export namespace Game {
  export const selectSchema = createSelectSchema(game);
  export type Select = z.infer<typeof selectSchema>;

  export const insertSchema = createInsertSchema(game).omit(timestampMask);
  export type Insert = z.infer<typeof insertSchema>;

  export const updateSchema = createUpdateSchema(game).omit(timestampMask);
  export type Update = z.infer<typeof updateSchema>;
}

export namespace Mod {
  export const selectSchema = createSelectSchema(mod);
  export type Select = z.infer<typeof selectSchema>;

  export const insertSchema = createInsertSchema(mod).omit(timestampMask);
  export type Insert = z.infer<typeof insertSchema>;

  export const updateSchema = createUpdateSchema(mod).omit(timestampMask);
  export type Update = z.infer<typeof updateSchema>;
}

export namespace Processable {
  export const selectSchema = createSelectSchema(processable);
  export type Select = z.infer<typeof selectSchema>;

  export const insertSchema =
    createInsertSchema(processable).omit(timestampMask);
  export type Insert = z.infer<typeof insertSchema>;

  export const updateSchema =
    createUpdateSchema(processable).omit(timestampMask);
  export type Update = z.infer<typeof updateSchema>;
}

export namespace Recipe {
  export const selectSchema = createSelectSchema(recipe);
  export type Select = z.infer<typeof selectSchema>;

  export const insertSchema = createInsertSchema(recipe).omit(timestampMask);
  export type Insert = z.infer<typeof insertSchema>;

  export const updateSchema = createUpdateSchema(recipe).omit(timestampMask);
  export type Update = z.infer<typeof updateSchema>;
}

export namespace Processor {
  export const selectSchema = createSelectSchema(processor);
  export type Select = z.infer<typeof selectSchema>;

  export const insertSchema = createInsertSchema(processor).omit(timestampMask);
  export type Insert = z.infer<typeof insertSchema>;

  export const updateSchema = createUpdateSchema(processor).omit(timestampMask);
  export type Update = z.infer<typeof updateSchema>;
}
