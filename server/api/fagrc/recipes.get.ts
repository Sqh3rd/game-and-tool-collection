import { inArray } from "drizzle-orm";
import { recipe } from "hub:db:schema";
import z from "zod/v4";

const modsQuery = z.object({
    mods: z.array(z.number())
});

export default defineEventHandler(async (event) => {
    const query = await getValidatedQuery(event, modsQuery.parse);

    const recipes = await db.query.recipe.findMany({
        where: {
            modId: {
                in: query.mods
            }
        },
        with: {
            ingredients: {
                columns: {
                    quantity: true,
                    measurement: true,
                    processableId: true
                }
            },
            yield: {
                columns: {
                    quantity: true,
                    measurement: true,
                    processableId: true
                }
            }
        }
    });
});