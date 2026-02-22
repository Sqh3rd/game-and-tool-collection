
export default defineEventHandler(async (event) => {
  return await db.query.game.findMany({ with: { icon: true } });
});
