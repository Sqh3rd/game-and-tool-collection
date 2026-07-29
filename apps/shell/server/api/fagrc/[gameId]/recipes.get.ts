import * as z from "zod";
import { singularIdParamSchema } from "~~/server/utils/paramSchemas";

const gameIdRouteParamSchema = singularIdParamSchema("gameId");
const modIdQueryParamSchema = z.object({
  modIds: z.array(z.number().nonnegative()).optional(),
});

export default defineEventHandler(async (event) => {
  const { gameId } = await getValidatedRouterParams(
    event,
    gameIdRouteParamSchema.parse,
  );
  const { modIds } = await getValidatedQuery(
    event,
    modIdQueryParamSchema.parse,
  );
});
