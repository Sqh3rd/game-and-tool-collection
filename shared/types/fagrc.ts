import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { game } from "hub:db:schema";
import type * as z from "zod";

export const gameSchema = createSelectSchema(game);
export type Game = z.infer<typeof gameSchema>;

export const newGameSchema = createInsertSchema(game).omit({
  createdAt: true,
  updatedAt: true,
});
export type NewGame = z.infer<typeof newGameSchema>;
