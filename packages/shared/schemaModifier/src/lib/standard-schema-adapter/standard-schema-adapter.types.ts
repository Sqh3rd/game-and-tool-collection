import { StandardSchemaV1 } from "@standard-schema/spec";
import { Table } from "drizzle-orm";
import { Operations } from "../schema-modifier/schema-modifier.types";

export type StandardSchemaAdapter<
  BaseType extends StandardSchemaV1,
  ObjectType extends StandardSchemaV1<object>,
> = {
  createBaseSchemaGroup: (table: Table) => Record<Operations, ObjectType>;

  optional: (val: BaseType) => BaseType;
  array: (val: BaseType) => BaseType;
};
