import { StandardSchemaV1 } from "@standard-schema/spec";
import { IsUnion, Table } from "drizzle-orm";
import { Operations } from "../schema-modifier/schema-modifier.types";
import { z } from "zod";
import * as v from "valibot";
import {
  BuildSchema as ZBuildSchema,
  CoerceOptions as ZCoerceOptions,
} from "drizzle-orm/zod";
import { BuildSchema as VBuildSchema } from "drizzle-orm/valibot";

export type StandardSchemaAdapter<
  BaseType extends StandardSchemaV1,
  ObjectType extends StandardSchemaV1<object>,
> = {
  createBaseSchemaGroup: (table: Table) => Record<Operations, ObjectType>;

  optional: (val: StandardSchemaV1) => BaseType;
  array: (val: StandardSchemaV1) => BaseType;
};

export type TypeAdapter<T = unknown> = {
  zod: ZodTypeAdapter<T>;
  valibot: ValibotTypeAdapter<T>;
};
export type SchemaBuildAdapter<
  Type extends "insert" | "select" | "update",
  TTable extends Table,
> = {
  zod: ZBuildSchema<Type, TTable["_"]["columns"], undefined, ZCoerceOptions>;
  valibot: VBuildSchema<Type, TTable["_"]["columns"], undefined>;
};

type ZodTypeAdapter<T> =
  T extends StandardSchemaV1<infer Inner> ? ZodTypeAdapter<Inner>
  : T extends object ?
    T extends Date ?
      z.ZodDate
    : z.ZodObject<{
        [Key in keyof T]: undefined extends T[Key] ?
          z.ZodOptional<ZodTypeAdapter<Exclude<T[Key], undefined>>>
        : ZodTypeAdapter<T[Key]>;
      }>
  : z.ZodType<T>;

type ValibotTypeAdapter<
  T,
  RecursionCounter extends number[] = [],
  MaxRecursionDepth extends number = 10,
> =
  RecursionCounter["length"] extends MaxRecursionDepth ?
    v.LiteralSchema<"RecursionLimitReached", undefined>
  : T extends StandardSchemaV1<infer Inner> ?
    ValibotTypeAdapter<Inner, [0, ...RecursionCounter], MaxRecursionDepth>
  : T extends object ?
    T extends Date ?
      v.DateSchema<undefined>
    : v.ObjectSchema<
        ValibotObjectSchemaCreator<
          T,
          [0, ...RecursionCounter],
          MaxRecursionDepth
        >,
        undefined
      >
  : v.BaseSchema<T, T, v.BaseIssue<unknown>>;

type ValibotObjectSchemaCreator<
  T extends object,
  RecursionCounter extends number[] = [],
  MaxRecursionDepth extends number = 10,
> =
  RecursionCounter["length"] extends MaxRecursionDepth ?
    {
      "recursion limit reached": v.LiteralSchema<
        "RecursionLimitReached",
        undefined
      >;
    }
  : {
      [Key in keyof T]: undefined extends T[Key] ?
        v.OptionalSchema<
          ValibotTypeAdapter<
            Exclude<T[Key], undefined>,
            RecursionCounter,
            MaxRecursionDepth
          >,
          undefined
        >
      : ValibotTypeAdapter<T[Key], [0, ...RecursionCounter], MaxRecursionDepth>;
    };

export type StandardSchemaAdapters = {
  [Key in keyof TypeAdapter]: StandardSchemaAdapter<
    TypeAdapter[Key],
    TypeAdapter<StandardSchemaV1<object>>[Key]
  >;
};
