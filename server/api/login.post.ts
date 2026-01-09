import { eq } from "drizzle-orm";
import { users } from "hub:db:schema";

export default defineEventHandler(async (event) => {
  const result = await readValidatedBody(event, loginSchema.safeParse);
  const err = createError({
    status: 401,
    message: "Incorrect E-Mail or Password",
  });
  if (!result.success) throw err;

  const { email, password } = result.data;

  const userQuery = await db.select().from(users).where(eq(users.email, email));
  if (userQuery.length === 0 || userQuery[0] == null) throw err;

  const user = userQuery[0];
  const isPwdValid = verifyPassword(user.hashedPassword, password);
  if (!isPwdValid) throw err;

  if (passwordNeedsReHash(user.hashedPassword)) {
    const newlyHashedPwd = await hashPassword(password);
    db.update(users)
      .set({ hashedPassword: newlyHashedPwd })
      .where(eq(users.id, user.id));
  }

  await setUserSession(event, { user: { email: user.email, name: user.name } });

  return {};
});
