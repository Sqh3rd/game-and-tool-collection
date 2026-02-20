import { parseSimpleXML } from "./parseXML";
import { isXMLElementWith, type XMLAttributes, type XMLElement } from "./xml";

type GraphicsTags =
  | "circle"
  | "ellipse"
  | "image"
  | "line"
  | "path"
  | "polygon"
  | "rect"
  | "text"
  | "use";
type ContainerTags =
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
export type SVGTags = GraphicsTags | ContainerTags;
export type SimpleSVGElement = {
  tag: SVGTags;
  attributes: XMLAttributes;
  children: SimpleSVGElement[];
};

const GRAPHICS_TAGS = [
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

const CONTAINER_TAGS = [
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

const SVG_TAGS = [...GRAPHICS_TAGS, ...CONTAINER_TAGS] as const;

const isValidSVGTag = (tag: string): tag is SVGTags =>
  (SVG_TAGS as unknown as string[]).includes(tag);
const canBeConvertedToSVG = (xmlElement: XMLElement): boolean => {
  if (!isValidSVGTag(xmlElement.tag)) return false;
  if (isXMLElementWith(xmlElement, "content")) return false;
  else if (isXMLElementWith(xmlElement, "nothing")) return true;
  else if (isXMLElementWith(xmlElement, "children"))
    return xmlElement.children.every((it) => canBeConvertedToSVG(it));
  return false;
};
const convertToSVG = (xmlElement: XMLElement): SimpleSVGElement | undefined => {
  if (!canBeConvertedToSVG(xmlElement)) return undefined;

  return {
    tag: xmlElement.tag as SVGTags,
    attributes: xmlElement.attributes,
    children:
      isXMLElementWith(xmlElement, "children") ?
        xmlElement.children
          .map((child) => convertToSVG(child))
          .filter((it) => !!it)
      : [],
  };
};

export const parseSimpleSVG = (svgString: string) => {
  const xml = parseSimpleXML(svgString);
  const svg = convertToSVG(xml);
  if (!svg) throw new Error("Conversion from XML to SVG failed");
  return svg;
};
