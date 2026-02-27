import type {
  AllowedComponentProps,
  ComponentCustomProps,
  VNodeProps,
} from "vue";

export type GetProps<T extends abstract new (...args: any) => any> =
  InstanceType<T> extends infer A ?
    "$props" extends keyof A ?
      A["$props"]
    : never
  : never;

export type GetComponentProps<T extends abstract new (...args: any) => any> =
  GetProps<T> extends infer props ?
    props extends object ?
      Omit<
        props,
        | keyof VNodeProps
        | keyof AllowedComponentProps
        | keyof ComponentCustomProps
      >
    : props
  : never;

export type DataGroupedByProperties<
  T extends object,
  Keys extends (keyof T)[],
  Count extends number[] = [],
> = IfThenElse<
  Equals<Count["length"], Keys["length"]>,
  T,
  Map<
    T[Keys[Count["length"]]],
    DataGroupedByProperties<T, Keys, [...Count, 0]>[]
  >
>;
