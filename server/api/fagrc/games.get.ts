import superjson from "superjson";

export default defineEventHandler(async () => {
  const games = await db.query.game.findMany({ with: { icon: true } });
  return superjson.stringify(games) as unknown as typeof games;
});
