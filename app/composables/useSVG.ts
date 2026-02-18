type GraphicsElements =
  | "circle"
  | "ellipse"
  | "image"
  | "line"
  | "path"
  | "polygon"
  | "rect"
  | "text"
  | "use";
type ContainerElements =
  | "a"
  | "defs"
  | "glyph"
  | "g"
  | "marker"
  | "mask"
  | "missing-glyph"
  | "pattern"
  | "svg"
  | "switch"
  | "symbol";
type SVGElements = GraphicsElements | ContainerElements;
type SVGComponent = {
  namespace?: string;
  element: SVGElements;
  children: SVGComponent[];
  attributes: Record<string, string>;
};

const GRAPHICS_ELEMENTS = [
  "circle",
  "ellipse",
  "image",
  "line",
  "path",
  "polygon",
  "rect",
  "text",
  "use",
] as const;

const CONTAINER_ELEMENTS = [
  "a",
  "defs",
  "glyph",
  "g",
  "marker",
  "mask",
  "missing-glyph",
  "pattern",
  "svg",
  "switch",
  "symbol",
] as const;

const isGraphicsElement = (it: string): it is GraphicsElements =>
  (GRAPHICS_ELEMENTS as unknown as string[]).includes(it.toLowerCase());

const isContainerElement = (it: string): it is ContainerElements =>
  (CONTAINER_ELEMENTS as unknown as string[]).includes(it.toLowerCase());

const isSvgElement = (it: string): it is SVGElements =>
  isGraphicsElement(it) || isContainerElement(it);

const parseSVG = (content: string) => {
  if (content.at(0) !== "<")
    throw new Error(`Expected svg component to start with "<"`);
  let elementNameStart = 1;
  let index = 1;
  while (content.at(index)?.match(/\w/)) index++;

  let namespace: string | undefined = undefined;

  if (content.at(index) === ":") {
    namespace = content.substring(1, index);
    elementNameStart = ++index;
    while (content.at(index)?.match(/\w/)) index++;
  }

  const elementType = content.substring(elementNameStart, index);
  if (!isSvgElement(elementType))
    throw new Error(`Invalid svg element "${elementType}"`);

  const attributes: Record<string, string> = {};

  const element: SVGComponent = {
    namespace,
    element: elementType,
    attributes: {},
    children: [],
  };
};

export const useSVG = () => ({ parseInline: parseSVG });
