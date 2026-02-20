import type { RemovePrefix, WithPrefix } from "./helperTypes";

export type XMLAttributes = Record<string, string | undefined | boolean>;

export type XMLElementTypes = {
  withContent: { content: string };
  withChildren: { children: XMLElement[] };
  withNothing: object;
};

export type XMLElement<
  With extends keyof XMLElementTypes = keyof XMLElementTypes,
> = {
  tag: string;
  attributes: XMLAttributes;
  comments: string[];
  isSelfClosed: boolean;
  has: Uncapitalize<RemovePrefix<With, "with">>;
} & XMLElementTypes[With];

export function changeXMLElementType<
  W extends Uncapitalize<RemovePrefix<keyof XMLElementTypes, "with">>,
>(
  element: XMLElement,
  type: W,
): asserts element is XMLElement<WithPrefix<W, "with">> {
  element.has = type;
  if (isXMLElementWith(element, "children") && !element.children) {
    element.children = [];
  } else if (isXMLElementWith(element, "content") && !element.content) {
    element.content = "";
  }
}

export const isXMLElementWith = <
  W extends Uncapitalize<RemovePrefix<keyof XMLElementTypes, "with">>,
>(
  element: XMLElement,
  withType: W,
): element is XMLElement<WithPrefix<W, "with">> => element.has === withType;
