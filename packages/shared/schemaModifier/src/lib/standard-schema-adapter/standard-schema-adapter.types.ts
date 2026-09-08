import { StandardSchemaV1 } from "@standard-schema/spec";
import { Table } from "drizzle-orm";
import { Operations } from "../schema-modifier/schema-modifier.types";
import { z } from "zod";

export type StandardSchemaAdapter<
  BaseType extends StandardSchemaV1,
  ObjectType extends StandardSchemaV1<object>,
> = {
  createBaseSchemaGroup: (table: Table) => Record<Operations, ObjectType>;

  optional: (val: StandardSchemaV1) => BaseType;
  array: (val: StandardSchemaV1) => BaseType;
};

export type TypeAdapter<T extends StandardSchemaV1 = StandardSchemaV1> = {
  zod: ZodTypeAdapter<T>;
};

type ZodTypeAdapter<T> =
  T extends StandardSchemaV1<infer Inner> ? ZodTypeAdapter<Inner>
  : T extends object ? z.ZodObject<{ [Key in keyof T]: ZodTypeAdapter<T[Key]> }>
  : z.ZodType<T>;

export type StandardSchemaAdapters = {
  [Key in keyof TypeAdapter]: StandardSchemaAdapter<
    TypeAdapter[Key],
    TypeAdapter<StandardSchemaV1<object>>[Key]
  >;
};
