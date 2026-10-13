import { StandardSchemaV1 } from "@standard-schema/spec";
import { Table } from "drizzle-orm";
import { Operations } from "../schema-modifier/schema-modifier.types";
import { z } from "zod";
import * as v from "valibot";
import * as dz from "drizzle-orm/zod";
import * as dv from "drizzle-orm/valibot";
import { Prettify } from "@gatc/utils";

export type StandardSchemaAdapter<
  BaseType extends StandardSchemaV1 = StandardSchemaV1,
  ObjectType extends StandardSchemaV1<object> = StandardSchemaV1<object>,
> = {
  createBaseSchemaGroup: (table: Table) => Record<Operations, ObjectType>;

  optional: (val: StandardSchemaV1) => BaseType;
  array: (val: StandardSchemaV1) => BaseType;
};

export type ValidationLibs = "valibot" | "zod";
export type SchemaBuildAdapter<
  Type extends "insert" | "select" | "update",
  TTable extends Table,
> = {
  zod: dz.BuildSchema<
    Type,
    TTable["_"]["columns"],
    undefined,
    dz.CoerceOptions
  >;
  valibot: dv.BuildSchema<Type, TTable["_"]["columns"], undefined>;
};

export type BaseValues = {
  valibot: {
    Base: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>;
    Object: v.ObjectSchema<v.ObjectEntries, undefined>;
  };
  zod: { Base: z.ZodType; Object: z.ZodObject };
};

type ValidationSchema<T = unknown> = {
  valibot: {
    Object: T extends v.ObjectEntries ? v.ObjectSchema<T, undefined> : never;
    Optional: T extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>> ?
      v.OptionalSchema<T, undefined>
    : never;
    Date: v.DateSchema<undefined>;
    Base: v.BaseSchema<T, T, v.BaseIssue<unknown>>;
  };
  zod: {
    Object: T extends z.ZodRawShape ? z.ZodObject<T> : never;
    Optional: T extends z.ZodType ? z.ZodOptional<T> : never;
    Date: z.ZodDate;
    Base: z.ZodType<T>;
  };
};

export type Extract<TAdapter extends ValidationLibs, T> =
  T extends ValidationSchema<infer Inner extends object>[TAdapter]["Object"] ?
    Inner
  : T;

export type Wrap<
  TAdapter extends ValidationLibs,
  T,
> = ValidationSchema<T>[TAdapter]["Object"];

export type PrettifyAdapterObject<TAdapter extends ValidationLibs, T> =
  T extends ValidationSchema<infer Inner extends object>[TAdapter]["Object"] ?
    ValidationSchema<Prettify<Inner>>[TAdapter]["Object"]
  : T;

export type Adapter<T, Lib extends ValidationLibs> =
  T extends StandardSchemaV1<infer Inner> ? Adapter<Inner, Lib>
  : T extends object ?
    T extends Date ?
      ValidationSchema[Lib]["Date"]
    : ValidationSchema<{
        [Key in keyof T]-?: undefined extends T[Key] ?
          ValidationSchema<
            Adapter<Exclude<T[Key], undefined>, Lib>
          >[Lib]["Optional"]
        : Adapter<T[Key], Lib>;
      }>[Lib]["Object"]
  : ValidationSchema<T>[Lib]["Base"];

export type StandardSchemaAdapters = {
  [Key in ValidationLibs]: StandardSchemaAdapter<
    BaseValues[Key]["Base"],
    BaseValues[Key]["Object"]
  >;
};
