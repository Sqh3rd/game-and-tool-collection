import {
  changeXMLElementType,
  isXMLElementWith,
  type XMLElement as SimpleXMLElement,
  type XMLAttributes,
} from "./xml";

const ERRORS = {
  UNDEFINED_ROOT_ELEMENT: () => new Error(`Root element undefined`),
  INVALID_EMPTY_TAG: () => new Error("Invalid empty tag"),
  INCONSISTENT_XML_ELEMENT_TYPE: () =>
    new Error(`XML Element cannot have text content and nested elements`),
  OPENING_CLOSING_TAG_MISMATCH: (tags: { opening: string; closing: string }) =>
    new Error(
      `End tag "${tags.closing}" doesn't match opening tag "${tags.opening}"`,
    ),
  MORE_THAN_ONE_ROOT_ELEMENT: () =>
    new Error(`More than one root element found`),
  UNEXPECTED_TOKEN: (line: string, idx: number) =>
    new Error(`Unexpected token encountered\n${line}\n${" ".repeat(idx)}^`),
};

const getCurrentLine = (xml: string, idx: number) => {
  let startIdx = idx;
  while (startIdx > 0 && xml.charAt(startIdx) !== "\n") startIdx--;
  let endIdx = idx;
  while (endIdx < xml.length && xml.charAt(endIdx) !== "\n") endIdx++;
  return {
    currentLine: xml.substring(startIdx, endIdx),
    startIdx,
    endIdx,
    idx,
  };
};
const createTokenErrorOnSymbol = (xml: string, idx: number) => {
  const { currentLine, startIdx } = getCurrentLine(xml, idx);
  return ERRORS.UNEXPECTED_TOKEN(currentLine, idx - startIdx);
};

type ParsedChars = { parsedChars: number };

const parseContent = (
  content: string,
  startIndex: number,
): { content: string } & ParsedChars => {
  if (content.at(startIndex) === "<") {
    throw new Error(`Expected text content to start with a legal character`);
  }

  let i: number;
  for (i = startIndex; i < content.length; i++) {
    if (content.at(i) === "<") break;
  }

  return {
    content: content.substring(startIndex, i).trim(),
    parsedChars: i - startIndex - 1,
  };
};

const parseComment = (
  content: string,
  startIndex: number,
): { comment: string } & ParsedChars => {
  if (
    content.at(startIndex) !== "<"
    || content.at(startIndex + 1) !== "!"
    || content.at(startIndex + 2) !== "-"
    || content.at(startIndex + 3) !== "-"
  ) {
    throw new Error(
      `Expected comment to start with "<!--" but found "${content.substring(0, 4)}" instead.`,
    );
  }

  let i: number;
  let comment = "";
  for (i = startIndex + 4; i < content.length; i++) {
    if (content.substring(i, i + 3) === "-->") {
      comment = content.substring(startIndex + 4, i).trim();
      break;
    }
  }

  return { comment, parsedChars: i + 2 - startIndex };
};

const parseEndTag = (content: string, startIndex: number) => {
  if (content.at(startIndex) !== "<" || content.at(startIndex + 1) !== "/") {
    throw new Error(
      `Expected end tag to start with "</" but found "${content.substring(0, 2)}" instead.`,
    );
  }

  let i = startIndex + 2;
  let spaceEncountered = false;
  for (i; i < content.length; i++) {
    const curChar = content.at(i);
    if (curChar === ">") {
      break;
    }
    if (curChar?.match(/\s/)) {
      spaceEncountered = true;
    } else if (spaceEncountered) {
      throw createTokenErrorOnSymbol(content, i);
    }
  }

  const tag = content.substring(startIndex + 2, i).trim();

  return { tag, parsedChars: i - startIndex };
};

const parseTag = (
  content: string,
  startIndex: number,
): SimpleXMLElement & ParsedChars => {
  if (
    !(content.at(startIndex) === "<" && content.at(startIndex + 1)?.match(/\w/))
  ) {
    throw new Error(
      `Expected tag to start with "^<\\w" but found "${content.substring(0, 2)}" instead`,
    );
  }

  // parse tag
  let i = startIndex + 1;
  let isSelfClosed = false;
  let isClosed = false;
  let spaceEncountered = false;
  let tag = "";
  for (i; i < content.length; i++) {
    const currentChar = content.at(i);
    if (currentChar === "/") {
      isClosed = isSelfClosed = true;
      tag = content.substring(startIndex + 1, i).trim();
      i++;
      break;
    } else if (currentChar === ">") {
      isClosed = true;
      tag = content.substring(startIndex + 1, i).trim();
      break;
    } else if (currentChar?.match(/\s/)) {
      spaceEncountered = true;
      continue;
    } else if (spaceEncountered) {
      // if we encountered a space and a following character does not close the tag,
      // we need to parse attributes
      tag = content.substring(startIndex + 1, i).trim();
      break;
    }
  }

  if (!tag) throw ERRORS.INVALID_EMPTY_TAG();

  if (isClosed)
    return {
      attributes: {},
      comments: [],
      isSelfClosed,
      parsedChars: i - startIndex,
      tag,
      has: "nothing",
    };

  // parse attributes
  const attributes: XMLAttributes = {};
  let attributeStart = i;
  let lastAttribute = "";
  let valueStart = i;
  let isEscaped = false;

  for (i; i < content.length; i++) {
    const currentChar = content.at(i);
    if (currentChar === '"') {
      if (!lastAttribute) throw createTokenErrorOnSymbol(content, i);
      if (isEscaped) {
        attributes[lastAttribute] = content.substring(valueStart, i);
        lastAttribute = "";
      } else {
        valueStart = i + 1;
      }
      isEscaped = !isEscaped;
    }
    if (isEscaped) continue;
    if (currentChar === ">") break;
    if (currentChar === "/") {
      isSelfClosed = true;
      i++;
      break;
    }
    if (currentChar?.match(/\s/)) {
      attributeStart = i + 1;
    } else if (currentChar === "=") {
      lastAttribute = content.substring(attributeStart, i);
      attributes[lastAttribute] = true;
    }
  }

  return {
    attributes,
    comments: [],
    isSelfClosed,
    parsedChars: i - startIndex,
    tag,
    has: "nothing",
  };
};

type HandleTagResult = { isRootTagClosed: boolean } & ParsedChars;

type HandleElementParams = {
  simpleXML: string;
  idx: number;
  lastElement: SimpleXMLElement | undefined;
  elements: SimpleXMLElement[];
};

const handleEndTag = ({
  simpleXML,
  idx,
  lastElement,
  elements,
}: HandleElementParams & {
  lastElement: SimpleXMLElement;
}): HandleTagResult => {
  const { parsedChars, tag } = parseEndTag(simpleXML, idx);
  if (tag !== lastElement.tag) {
    throw ERRORS.OPENING_CLOSING_TAG_MISMATCH({
      opening: lastElement.tag,
      closing: tag,
    });
  }
  if (elements.length === 1) return { isRootTagClosed: true, parsedChars };
  const child = elements.pop();
  const newLastElement = elements[elements.length - 1];
  if (!newLastElement) {
    throw ERRORS.UNDEFINED_ROOT_ELEMENT;
  }
  if (isXMLElementWith(newLastElement, "content")) {
    throw ERRORS.INCONSISTENT_XML_ELEMENT_TYPE;
  }
  changeXMLElementType(newLastElement, "children");
  if (child) newLastElement.children.push(child);
  return { isRootTagClosed: false, parsedChars };
};

const handleOpeningTag = ({
  simpleXML,
  idx,
  elements,
  lastElement,
}: HandleElementParams): HandleTagResult => {
  const { parsedChars, ...parsedTag } = parseTag(simpleXML, idx);
  if (!parsedTag.isSelfClosed) {
    elements.push(parsedTag);
    return { isRootTagClosed: false, parsedChars };
  }
  if (!lastElement) {
    elements.push(parsedTag);
    return { isRootTagClosed: true, parsedChars };
  }
  if (isXMLElementWith(lastElement, "content")) {
    throw ERRORS.INCONSISTENT_XML_ELEMENT_TYPE;
  }
  changeXMLElementType(lastElement, "children");
  lastElement.children.push(parsedTag);
  return { isRootTagClosed: false, parsedChars };
};

const handleElement = ({
  simpleXML,
  idx,
  lastElement,
  elements,
}: HandleElementParams) => {
  let idxIncrease = 0;
  let shouldTerminate = false;
  switch (simpleXML.at(idx + 1)) {
    case "/": {
      if (!lastElement) throw ERRORS.UNDEFINED_ROOT_ELEMENT();
      const { isRootTagClosed, parsedChars } = handleEndTag({
        simpleXML,
        elements,
        idx,
        lastElement,
      });
      idxIncrease = parsedChars;
      shouldTerminate = isRootTagClosed;
      break;
    }
    case "!": {
      const { parsedChars, comment } = parseComment(simpleXML, idx);
      lastElement?.comments.push(comment);
      idxIncrease = parsedChars;
      break;
    }
    default: {
      const { isRootTagClosed, parsedChars } = handleOpeningTag({
        simpleXML,
        elements,
        idx,
        lastElement,
      });
      idxIncrease = parsedChars;
      shouldTerminate = isRootTagClosed;
      break;
    }
  }
  return { idxIncrease, shouldTerminate };
};

/**
 * Parse simple XML.
 *
 * Simple XML refers to strings that declare tags and attributes, but cannot handle doctypes, XML declarations, namespaces, or similar
 * "complex" features.
 */
export const parseSimpleXML = (simpleXML: string): SimpleXMLElement => {
  simpleXML = simpleXML.trim();
  const initialChar = simpleXML.at(0);
  if (initialChar !== "<")
    throw new Error(
      `Expected XML to start with "<" but found "${initialChar}" instead`,
    );
  const elements: SimpleXMLElement[] = [];
  let i = 0;
  for (i; i < simpleXML.length; i++) {
    const currentChar = simpleXML.at(i);
    if (currentChar?.match(/\s/)) continue;

    const lastElement = elements[elements.length - 1];

    if (currentChar !== "<") {
      if (!lastElement) {
        throw ERRORS.UNDEFINED_ROOT_ELEMENT();
      }
      if (isXMLElementWith(lastElement, "children")) {
        throw ERRORS.INCONSISTENT_XML_ELEMENT_TYPE();
      }
      changeXMLElementType(lastElement, "content");
      const textContent = parseContent(simpleXML, i);
      lastElement.content = textContent.content;
      i += textContent.parsedChars;
      continue;
    }

    const { idxIncrease, shouldTerminate } = handleElement({
      simpleXML,
      idx: i,
      lastElement,
      elements,
    });
    i += idxIncrease;
    if (shouldTerminate) break;
  }

  if (elements.length > 1 || i < simpleXML.length - 1)
    throw ERRORS.MORE_THAN_ONE_ROOT_ELEMENT();
  const element = elements[0];
  if (element) return element;
  else throw ERRORS.UNDEFINED_ROOT_ELEMENT();
};
