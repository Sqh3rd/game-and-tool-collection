import { describe, expect, test } from "vitest";
import { parseSimpleXML } from "../../../shared/utils/parseXML";
import type { XMLElement } from "../../../shared/utils/xml";

const XML_INPUT = {
  SIMPLE: {
    VALID: `
<customers>
   <customer id="55000">
      <name>Charter Group</name>
      <address>
         <street>100 Main</street>
         <city>Framingham</city>
         <state>MA</state>
         <zip>01701</zip>
      </address>
      <address>
         <street>720 Prospect</street>
         <city>Framingham</city>
         <state>MA</state>
         <zip>01701</zip>
      </address>
      <address>
         <street>120 Ridge</street>
         <state>MA</state>
         <zip>01760</zip>
      </address>
   </customer>
   <customer />
   <customer id="12345" />
   <customer><!-- This is a comment --></customer>
</customers>
`,
    MULTIPLE_ROOT_ELEMENTS: `
<customers />
<customers />
`,
    INVALID_INITIAL_CHARACTER: `
customers />`,
    INVALID_HIGH_QUOTE: `
<customers "t"="123" />
`,
  },
};

const XML_OUTPUT = {
  SIMPLE: {
    tag: "customers",

    attributes: {},
    children: [
      {
        tag: "customer",

        attributes: { id: "55000" },
        children: [
          {
            tag: "name",

            attributes: {},
            has: "content",
            isSelfClosed: false,
            comments: [],
            content: "Charter Group",
          } satisfies XMLElement<"withContent">,
          {
            tag: "address",

            attributes: {},
            children: [
              {
                tag: "street",

                attributes: {},
                has: "content",
                isSelfClosed: false,
                comments: [],
                content: "100 Main",
              } satisfies XMLElement<"withContent">,
              {
                tag: "city",

                attributes: {},
                has: "content",
                isSelfClosed: false,
                comments: [],
                content: "Framingham",
              } satisfies XMLElement<"withContent">,
              {
                tag: "state",

                attributes: {},
                has: "content",
                isSelfClosed: false,
                comments: [],
                content: "MA",
              } satisfies XMLElement<"withContent">,
              {
                tag: "zip",

                attributes: {},
                has: "content",
                isSelfClosed: false,
                comments: [],
                content: "01701",
              } satisfies XMLElement<"withContent">,
            ],
            comments: [],
            has: "children",
            isSelfClosed: false,
          } satisfies XMLElement<"withChildren">,
          {
            tag: "address",

            attributes: {},
            children: [
              {
                tag: "street",

                attributes: {},
                has: "content",
                isSelfClosed: false,
                comments: [],
                content: "720 Prospect",
              } satisfies XMLElement<"withContent">,
              {
                tag: "city",

                attributes: {},
                has: "content",
                isSelfClosed: false,
                comments: [],
                content: "Framingham",
              } satisfies XMLElement<"withContent">,
              {
                tag: "state",

                attributes: {},
                has: "content",
                isSelfClosed: false,
                comments: [],
                content: "MA",
              } satisfies XMLElement<"withContent">,
              {
                tag: "zip",

                attributes: {},
                has: "content",
                isSelfClosed: false,
                comments: [],
                content: "01701",
              } satisfies XMLElement<"withContent">,
            ],
            comments: [],
            has: "children",
            isSelfClosed: false,
          } satisfies XMLElement<"withChildren">,
          {
            tag: "address",

            attributes: {},
            children: [
              {
                tag: "street",

                attributes: {},
                has: "content",
                isSelfClosed: false,
                comments: [],
                content: "120 Ridge",
              } satisfies XMLElement<"withContent">,
              {
                tag: "state",

                attributes: {},
                has: "content",
                isSelfClosed: false,
                comments: [],
                content: "MA",
              } satisfies XMLElement<"withContent">,
              {
                tag: "zip",

                attributes: {},
                has: "content",
                isSelfClosed: false,
                comments: [],
                content: "01760",
              } satisfies XMLElement<"withContent">,
            ],
            comments: [],
            has: "children",
            isSelfClosed: false,
          } satisfies XMLElement<"withChildren">,
        ],
        comments: [],
        has: "children",
        isSelfClosed: false,
      } satisfies XMLElement<"withChildren">,
      {
        tag: "customer",

        attributes: {},
        comments: [],
        has: "nothing",
        isSelfClosed: true,
      } satisfies XMLElement<"withNothing">,
      {
        tag: "customer",

        attributes: { id: "12345" },
        comments: [],
        has: "nothing",
        isSelfClosed: true,
      } satisfies XMLElement<"withNothing">,
      {
        tag: "customer",

        attributes: {},
        comments: ["This is a comment"],
        has: "nothing",
        isSelfClosed: false,
      } satisfies XMLElement<"withNothing">,
    ],
    comments: [],
    has: "children",
    isSelfClosed: false,
  } satisfies XMLElement<"withChildren">,
};

type SimpleTestCase = { name: string; input: string } & (
  | { shouldPass: true; expected: XMLElement }
  | { shouldPass: false; expected: string | RegExp }
);
const SIMPLE_TEST_CASES: SimpleTestCase[] = [
  {
    name: "Valid Data",
    input: XML_INPUT.SIMPLE.VALID,
    shouldPass: true,
    expected: XML_OUTPUT.SIMPLE,
  },
  {
    name: "Multiple Root Elements",
    input: XML_INPUT.SIMPLE.MULTIPLE_ROOT_ELEMENTS,
    shouldPass: false,
    expected: "More than one root element found",
  },
  {
    name: "Invalid High Quote",
    input: XML_INPUT.SIMPLE.INVALID_HIGH_QUOTE,
    shouldPass: false,
    expected: `Unexpected token encountered\n<customers "t"="123" />\n           ^`,
  },
  {
    name: "Invalid Initial Character",
    input: XML_INPUT.SIMPLE.INVALID_INITIAL_CHARACTER,
    shouldPass: false,
    expected: `Expected XML to start with "<" but found "c" instead`,
  },
];

describe("Parse Simple XML", () => {
  for (const testCase of SIMPLE_TEST_CASES) {
    test(`${testCase.shouldPass ? "[ OK]" : "[NOK]"} ${testCase.name}`, () => {
      if (testCase.shouldPass) {
        expect(parseSimpleXML(testCase.input)).to.deep.equal(testCase.expected);
      } else {
        expect(() => parseSimpleXML(testCase.input)).to.throw(
          testCase.expected,
        );
      }
    });
  }
});
