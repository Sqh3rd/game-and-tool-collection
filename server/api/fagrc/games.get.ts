import { game } from "hub:db:schema";

export default defineEventHandler(async (event) => {
  return await db.select().from(game);
});
