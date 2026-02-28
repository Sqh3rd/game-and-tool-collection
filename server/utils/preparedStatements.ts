import { processable } from "@nuxthub/db/schema";
import { and, eq, inArray, isNull, max, or, sql } from "drizzle-orm";

export const preparedStatemens = (
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
