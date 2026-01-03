import z from "zod";

const bodySchema = z.object({
    email: z.email(),
    password: z.string().min(4)
});

export default defineEventHandler(async (event) => {
    const { email, password } = await readValidatedBody(event, bodySchema.parse);

    if (email === "admin@admin.com" && password === "root") {
        await setUserSession(event, {
            user: {
                name: "John Doe"
            }
        });
        return {};
    }
    throw createError({
        status: 401,
        message: "Invalid Email or password"
    })
})