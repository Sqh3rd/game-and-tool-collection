import { MergeSchemas } from "@gatc/utils";
import { StandardSchemaV1 } from "@standard-schema/spec";

export type StandardSchemaAdapter = {
  extend: <Base extends StandardSchemaV1, Extension extends StandardSchemaV1>(
    base: Base,
    extension: Extension,
  ) => MergeSchemas<Base, Extension>;
};
