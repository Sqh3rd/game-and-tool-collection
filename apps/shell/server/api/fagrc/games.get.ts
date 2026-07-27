import { _serialize } from "~~/server/utils/_serialize";

export default defineEventHandler(async () => {
  const games = await db.query.game.findMany({ with: { icon: true } });
  return _serialize(games);
});
