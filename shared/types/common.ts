import { users } from "hub:db:schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

export const passwordSchema = z
  .string()
  .min(16, { error: "Must be at least 16 characters long" })
  .max(256, { error: "Must not be longer than 256 characters" })
  .superRefine((val, ctx) => {
    [
      {
        regex: /\p{Ll}/v,
        error: "Must include lowercase character",
        code: "l",
      },
      {
        regex: /\p{Lu}/v,
        error: "Must include uppercase character",
        code: "u",
      },
      { regex: /\p{Nd}/v, error: "Must include numeric character", code: "n" },
      {
        regex: /\p{P}|\p{S}|\p{Z}|\p{C}/v,
        error: "Must include special character",
        code: "s",
      },
    ]
      .filter((it) => !it.regex.test(val))
      .forEach((it) =>
        ctx.addIssue({
          code: "custom",
          message: it.error,
          params: { [it.code]: true },
          input: val,
        }),
      );
  });

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, { error: "Field is required" }),
});
export type Login = z.infer<typeof loginSchema>;

export const userSchema = createSelectSchema(users)
  .omit({ hashedPassword: true })
  .safeExtend({ email: z.email() });
export type User = z.infer<typeof userSchema>;

const tempNewUserSchema = createInsertSchema(users)
  .omit({ hashedPassword: true })
  .safeExtend({
    email: z.email(),
    name: z
      .string()
      .trim()
      .min(3, { error: "Must be at least 3 characters long" }),
    password: passwordSchema,
    confirmPassword: z.string().min(1, { error: "Field is required" }),
  });
export const newUserSchema = tempNewUserSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords do not match",
    path: ["confirmPassword"],
    when(payload) {
      return tempNewUserSchema
        .pick({ password: true, confirmPassword: true })
        .safeParse(payload.value).success;
    },
  },
);
export type NewUser = z.infer<typeof newUserSchema>;
