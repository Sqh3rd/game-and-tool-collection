import { and, asc, eq, inArray, isNull, or } from "drizzle-orm";
import { processable } from "hub:db:schema";
import * as z from "zod";
import { singularIdParamSchema } from "~~/server/utils/paramSchemas";

const gameIdRouteParamSchema = singularIdParamSchema("gameId");
const modIdQueryParamSchema = z.object({
  baseGame: z.boolean(),
  modIds: z.array(z.number().nonnegative()).optional(),
});

export default defineEventHandler(async (event) => {
  const { gameId } = await getValidatedRouterParams(
    event,
    gameIdRouteParamSchema.parse,
  );
  const { baseGame, modIds } = await getValidatedQuery(
    event,
    modIdQueryParamSchema.parse,
  );

  return await db
    .select()
    .from(processable)
    .orderBy(asc(processable.name))
    .where(
      and(
        eq(processable.gameId, gameId),
        or(
          baseGame ? isNull(processable.modId) : undefined,
          modIds?.length ? inArray(processable.modId, modIds) : undefined,
        ),
      ),
    );
});
