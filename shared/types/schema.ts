import { relations, schema } from "@nuxthub/db";
import { extractTablesFromSchema } from "drizzle-orm";
import * as z from "zod";
import type {
    InferInnerSchema,
    InferModifiedSchema,
} from "../utils/createSchemasFromTable";

export const timestampMask = { createdAt: true, updatedAt: true } as const;

// Mostly copy pasta from H3Error
export const serverErrorSchema = z.object({
  cause: z.unknown().optional(),
  name: z.string(),
  message: z.string(),
  stack: z.string().optional(),
  statusCode: z.number(),
  fatal: z.boolean(),
  unhandled: z.boolean(),
  statusMessage: z.string().optional(),
  data: z.unknown().optional(),
});
export type ServerError = z.infer<typeof serverErrorSchema>;

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

export const dbSchemas = createSchemaModifier(extractTablesFromSchema(schema))
  .modify("user", (base) => ({
    insert: base.insert
      .omit({ hashedPassword: true })
      .safeExtend({
        email: z.email(),
        name: z
          .string()
          .trim()
          .min(3, { error: "Must be at least 3 characters long" }),
        password: passwordSchema,
        confirmPassword: z.string().min(1, { error: "Field is required" }),
      })
      .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
      }),
    select: base.select
      .omit({ hashedPassword: true, uuid: true })
      .safeExtend({ email: z.email() }),
    update: base.update.omit(timestampMask),
  }))
  .modify("game", ({ insert, update }) => ({
    insert: insert.omit(timestampMask),
    update: update.omit(timestampMask),
  }))
  .modify("icon", ({ insert, update }) => ({
    insert: insert.omit(timestampMask),
    update: update.omit(timestampMask),
  }))
  .modify("mod", ({ insert, update }) => ({
    insert: insert.omit(timestampMask),
    update: update.omit(timestampMask),
  }))
  .modify("processable", ({ insert, update }) => ({
    insert: insert.omit(timestampMask),
    update: update.omit(timestampMask),
  }))
  .modify("processor", ({ insert, update }) => ({
    insert: insert.omit(timestampMask),
    update: update.omit(timestampMask),
  }))
  .modify("recipe", ({ insert, update }) => ({
    insert: insert.omit(timestampMask),
    update: update.omit(timestampMask),
  }))
  .withRelations(relations)
  .create();

export type DBSchema = InferModifiedSchema<typeof dbSchemas>;
export type InsertSchema = InferInnerSchema<DBSchema, "insert">;
export type SelectSchema = InferInnerSchema<DBSchema, "select">;
export type UpdateSchema = InferInnerSchema<DBSchema, "update">;
