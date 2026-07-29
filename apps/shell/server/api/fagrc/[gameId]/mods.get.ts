import { mod } from "@nuxthub/db/schema";
import { max } from "drizzle-orm";
import { singularIdParamSchema } from "~~/server/utils/paramSchemas";

const gameIdRouteParamSchema = singularIdParamSchema("gameId");

export default defineEventHandler(async (event) => {
  const { gameId } = await getValidatedRouterParams(
    event,
    gameIdRouteParamSchema.parse,
  );
  const data = await db.query.mod.findMany({
    with: { icon: true },
    where: { gameId },
  });
  const lastUpdate =
    (await db.select({ lastUpdate: max(mod.updatedAt) }).from(mod))[0]
      ?.lastUpdate ?? undefined;

  assertNotNull(lastUpdate);
  return _serialize({ data, lastUpdate });
});
