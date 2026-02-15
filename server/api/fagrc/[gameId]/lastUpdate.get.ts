import { and, desc, eq, inArray, isNull, max, or, sql } from "drizzle-orm";
import { processable, processor, recipe } from "hub:db:schema";
import * as z from "zod";

const gameIdRouteParamSchema = singularIdParamSchema("gameId");
const modIdQueryParamSchema = z.object({
  baseGame: z.boolean(),
  modIds: z.array(z.number().nonnegative()).optional(),
  entity: z.literal(["processable", "processor", "recipe"]),
});

const preparedStatemens = {
  processable: db
    .select({ updatedAt: max(processable.updatedAt) })
    .from(processable)
    .where(
      and(
        eq(processable.gameId, sql.placeholder("gameId")),
        or(sql.placeholder("isModIdNull"), sql.placeholder("isModIdInArray")),
      ),
    )
    .prepare("processable_last_update"),

  processor: db.query.processor
    .findFirst({
      columns: { updatedAt: true },
      with: { entity: true },
      where: and(
        eq(processable.gameId, sql.placeholder("gameId")),
        or(sql.placeholder("isModIdNull"), sql.placeholder("isModIdInArray")),
      ),
      orderBy: desc(processor.updatedAt),
    })
    .prepare("processor_last_update"),

  recipe: db
    .select({ lastUpdate: max(recipe.updatedAt)})
    .from(recipe)
};

export default defineEventHandler(async (event) => {
  const { gameId } = await getValidatedRouterParams(
    event,
    gameIdRouteParamSchema.parse,
  );
  const { baseGame, modIds, entity } = await getValidatedQuery(
    event,
    modIdQueryParamSchema.parse,
  );

  return preparedStatemens[entity];
});
