import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const result = await readValidatedBody(event, loginSchema.safeParse);
  const err = createError({
    status: 401,
    message: "Incorrect E-Mail or Password",
  });
  if (!result.success) throw err;

  const { email, password } = result.data;

  const userQuery = await db.select().from(user).where(eq(user.email, email));
  if (userQuery.length === 0 || userQuery[0] == null) throw err;

  const user = userQuery[0];
  const isPwdValid = verifyPassword(user.hashedPassword, password);
  if (!isPwdValid) throw err;

  if (passwordNeedsReHash(user.hashedPassword)) {
    const newlyHashedPwd = await hashPassword(password);
    db.update(user)
      .set({ hashedPassword: newlyHashedPwd })
      .where(eq(user.id, user.id));
  }

  await setUserSession(event, { user: { email: user.email, name: user.name } });

  return {};
});
