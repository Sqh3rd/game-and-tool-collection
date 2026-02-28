import { mod } from "@nuxthub/db/schema";
import { max, sql } from "drizzle-orm";
import * as z from "zod";
import { _serialize } from "~~/server/utils/_serialize";

const gameIdRouteParamSchema = singularIdParamSchema("gameId");
const modIdQueryParamSchema = z.object({
  baseGame: z.boolean().optional(),
  modIds: z.array(z.number().nonnegative()).optional(),
  entity: z.literal(["processable", "processor", "recipe", "mod"]),
});

const preparedStatemens = (
  baseGame: boolean,
  modIds: number[] | undefined,
) => ({
  processable: db.query.processable
    .findFirst({
      columns: { updatedAt: true },
      where: {
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
    })
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
  let result: Date | undefined | null = undefined;

  if (entity === "mod") {
    result = (await db.select({ lastUpdate: max(mod.updatedAt) }).from(mod))[0]
      ?.lastUpdate;
  } else {
    assertNotNull(baseGame);
    result = (
      await preparedStatemens(baseGame, modIds)[entity].execute({ gameId })
    )?.updatedAt;
  }

  assertNotNull(result);

  return _serialize(result);
});
