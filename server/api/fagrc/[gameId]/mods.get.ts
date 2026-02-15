import { eq } from "drizzle-orm";
import { mod } from "hub:db:schema";
import { singularIdParamSchema } from "~~/server/utils/paramSchemas";

const gameIdRouteParamSchema = singularIdParamSchema("gameId");

export default defineEventHandler(async (event) => {
  const { gameId } = await getValidatedRouterParams(
    event,
    gameIdRouteParamSchema.parse,
  );

  return await db.select().from(mod).where(eq(mod.gameId, gameId));
});
