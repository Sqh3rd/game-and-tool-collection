import { and, eq, inArray, isNull, max, or, sql } from "drizzle-orm";
import { processable } from "hub:db:schema";
import * as z from "zod";

const gameIdRouteParamSchema = singularIdParamSchema("gameId");
const modIdQueryParamSchema = z.object({
  baseGame: z.boolean(),
  modIds: z.array(z.number().nonnegative()).optional(),
  entity: z.literal(["processable", "processor", "recipe"]),
});

const preparedStatemens = (
  baseGame: boolean,
  modIds: number[] | undefined,
) => ({
  processable: db
    .select({ updatedAt: max(processable.updatedAt) })
    .from(processable)
    .where(
      and(
        eq(processable.gameId, sql.placeholder("gameId")),
        or(
          baseGame ? isNull(processable.modId) : undefined,
          modIds ? inArray(processable.modId, modIds) : undefined,
        ),
      ),
    )
    .prepare("processableLastUpdate"),

  processor: db.query.processor
    .findFirst({
      columns: { updatedAt: true },
      with: { entity: true },
      where: {
        entity: {
          AND: [
            { gameId: sql.placeholder("gameId") },
            {
              OR: [
                baseGame ? { modId: { isNull: true } } : {},
                modIds ? { modId: { arrayContains: modIds } } : {},
              ],
            },
          ],
        },
      },
      orderBy: { updatedAt: "asc" },
    })
    .prepare("processorLastUpdate"),

  recipe: db.query.recipe
    .findFirst({
      columns: { updatedAt: true },
      with: { ingredients: { with: { processable: true } } },
      where: {
        ingredients: {
          processable: {
            AND: [
              { gameId: sql.placeholder("gameId") },
              {
                OR: [
                  baseGame ? { modId: { isNull: true } } : {},
                  modIds ? { modId: { arrayContains: modIds } } : {},
                ],
              },
            ],
          },
        },
      },
    })
    .prepare("recipeLastUpdate"),
});

export default defineEventHandler(async (event) => {
  const { gameId } = await getValidatedRouterParams(
    event,
    gameIdRouteParamSchema.parse,
  );
  const { baseGame, modIds, entity } = await getValidatedQuery(
    event,
    modIdQueryParamSchema.parse,
  );

  return await preparedStatemens(baseGame, modIds)[entity].execute({ gameId });
});
