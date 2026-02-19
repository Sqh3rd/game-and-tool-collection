import { describe, expect, test } from "vitest";
import {
  parseSimpleSVG,
  type SimpleSVGElement,
} from "../../../../shared/utils/parsing/parseSVG";

const input = `
<svg width="100%" height="100%" viewBox="0 0 64 64" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;">
    <path d="M31.729,8.08c13.175,0 23.872,10.66 23.872,23.79c0,13.13 -10.697,23.79 -23.872,23.79c-13.175,0 -23.872,-10.66 -23.872,-23.79c0,-13.13 10.697,-23.79 23.872,-23.79Zm-0,3.23c-11.387,0 -20.631,9.213 -20.631,20.56c0,11.348 9.244,20.56 20.631,20.56c11.387,0 20.631,-9.213 20.631,-20.56c0,-11.348 -9.244,-20.56 -20.631,-20.56Z" style="fill:#d79e6a;"/>
    <ellipse cx="31.729" cy="31.87" rx="23.872" ry="23.79" style="fill:none;stroke:#652501;stroke-width:0.83px;"/>
    <g id="Teeth">
        <g id="Tooth-8" serif:id="Tooth 8">
            <path d="M2,26.629l2.903,0.325l0,6.111l-2.903,0.212l0,-6.647Z" style="fill:#d18038;stroke:#652501;stroke-width:0.83px;"/>
            <path d="M11.899,26.756l-0.042,7.268l-6.953,-0.96l0,-6.111l6.996,-0.198Z" style="fill:#d18038;stroke:#652501;stroke-width:0.83px;"/>
            <path d="M2,26.629l5.778,-0.663l4.121,0.79l-6.996,0.198l-2.903,-0.325Z" style="fill:#d18038;stroke:#652501;stroke-width:0.83px;"/>
            <path d="M8.245,35.168l-6.245,-1.891l2.903,-0.212l6.953,0.96l-3.611,1.143Z" style="fill:#d18038;stroke:#652501;stroke-width:0.83px;"/>
        </g>
        <g id="Tooth-7" serif:id="Tooth 7">
            <path d="M14.028,42.137l5.346,5.451l-5.346,4.427l-4.602,-4.815l4.602,-5.063Z" style="fill:#d18038;stroke:#652501;stroke-width:0.83px;"/>
            <path d="M7.053,49.264l3.877,-5.275l3.098,-1.852l-4.602,5.063l-2.372,2.064Z" style="fill:#d18038;stroke:#652501;stroke-width:0.83px;"/>
            <path d="M7.053,49.264l2.372,-2.064l4.602,4.815l-2.655,2.118l-4.319,-4.869Z" style="fill:#d18038;stroke:#652501;stroke-width:0.83px;"/>
            <path d="M19.374,47.588l-2.407,3.899l-5.594,2.646l2.655,-2.118l5.346,-4.427Z" style="fill:#d18038;stroke:#652501;stroke-width:0.83px;"/>
        </g>
        <g id="Tooth-6" serif:id="Tooth 6">
            <path d="M26.235,51.839l7.895,0.176l-0.566,6.757l-6.939,0l-0.389,-6.933Z" style="fill:#d18038;stroke:#652501;stroke-width:0.83px;"/>
            <path d="M26.624,62l0,-3.228l6.939,0l-0.159,3.228l-6.78,0Z" style="fill:#d18038;stroke:#652501;stroke-width:0.83px;"/>
            <path d="M34.13,52.015l0.655,4.71l-1.381,5.275l0.159,-3.228l0.566,-6.757Z" style="fill:#d18038;stroke:#652501;stroke-width:0.83px;"/>
            <path d="M25.544,55.737l0.69,-3.899l0.389,6.933l0,3.228l-1.08,-6.263Z" style="fill:#d18038;stroke:#652501;stroke-width:0.83px;"/>
        </g>
        <g id="Tooth-5" serif:id="Tooth 5">
            <path d="M42.279,49.576l5.481,-4.7l4.291,4.954l-4.886,4.77l-4.886,-5.024Z" style="fill:#d18038;stroke:#652501;stroke-width:0.83px;"/>
            <path d="M47.76,44.876l3.144,1.849l3.13,5.49l-1.983,-2.385l-4.291,-4.954Z" style="fill:#d18038;stroke:#652501;stroke-width:0.83px;"/>
            <path d="M48.907,56.675l-1.742,-2.075l4.886,-4.77l1.983,2.385l-5.126,4.46Z" style="fill:#d18038;stroke:#652501;stroke-width:0.83px;"/>
            <path d="M48.907,56.675l-5.353,-3.669l-1.275,-3.429l4.886,5.024l1.742,2.075Z" style="fill:#d18038;stroke:#652501;stroke-width:0.83px;"/>
        </g>
        <g id="Tooth-4" serif:id="Tooth 4">
            <path d="M56.052,29.299l5.948,1.389l-3.014,-0.158l-6.922,-1.174l3.988,-0.056Z" style="fill:#d18038;stroke:#652501;stroke-width:0.83px;"/>
            <path d="M52.064,29.355l6.922,1.174l0,6.661l-7.171,0.271l0.249,-8.106Z" style="fill:#d18038;stroke:#652501;stroke-width:0.83px;"/>
            <path d="M62,30.688l-0.306,6.842l-2.708,-0.339l0,-6.661l3.014,0.158Z" style="fill:#d18038;stroke:#652501;stroke-width:0.83px;"/>
            <path d="M51.815,37.462l7.171,-0.271l2.708,0.339l-5.891,0.644l-3.988,-0.711Z" style="fill:#d18038;stroke:#652501;stroke-width:0.83px;"/>
        </g>
        <g id="Tooth-3" serif:id="Tooth 3">
            <path d="M44.619,16.081l2.089,-2.928l5.443,-3.211l-1.974,2.205l-5.558,3.934l5.328,5.381l4.408,-4.781l-4.178,-4.534l1.974,-2.205l4.47,5.01l-2.235,1.729l2.235,-1.729l-3.593,4.869l-3.08,1.641" style="fill:#d18038;stroke:#652501;stroke-width:0.83px;"/>
            <path d="M44.619,16.081l5.558,-3.934l4.178,4.534l-4.408,4.781l-5.328,-5.381Z" style="fill:#d18038;stroke:#652501;stroke-width:0.83px;"/>
        </g>
        <g id="Tooth-2" serif:id="Tooth 2">
            <path d="M37.49,2.159l-0.726,2.84l-6.851,-0.265l0.885,-2.734l6.691,0.159Z" style="fill:#d18038;stroke:#652501;stroke-width:0.83px;"/>
            <path d="M29.913,4.734l6.851,0.265l0.354,7.127l-8.037,0.159l0.832,-7.55Z" style="fill:#d18038;stroke:#652501;stroke-width:0.83px;"/>
            <path d="M37.932,8.563l-0.814,3.564l-0.354,-7.127l0.726,-2.84l0.443,6.404Z" style="fill:#d18038;stroke:#652501;stroke-width:0.83px;"/>
        </g>
        <g id="Tooth-1" serif:id="Tooth 1">
            <path d="M14.926,7.269l-5.042,4.375l1.6,2.78l5.183,-4.319l-1.742,-2.837Z" style="fill:#d18038;stroke:#652501;stroke-width:0.83px;stroke-linecap:butt;stroke-miterlimit:2;"/>
            <path d="M11.485,14.424l4.263,4.996l5.746,-5.14l-4.826,-4.175l-5.183,4.319Z" style="fill:#d18038;stroke:#652501;stroke-width:0.83px;stroke-linecap:butt;stroke-miterlimit:2;"/>
            <path d="M21.494,14.28l-4.826,-4.175l-1.742,-2.837l4.687,3.832l1.88,3.18Z" style="fill:#d18038;stroke:#652501;stroke-width:0.83px;stroke-linecap:butt;stroke-miterlimit:2;"/>
        </g>
    </g>
    <path d="M31.729,11.309c11.387,0 20.631,9.213 20.631,20.56c0,11.348 -9.244,20.56 -20.631,20.56c-11.387,0 -20.631,-9.213 -20.631,-20.56c0,-11.348 9.244,-20.56 20.631,-20.56Zm0,9.26c-6.258,0 -11.339,5.064 -11.339,11.3c0,6.237 5.081,11.3 11.339,11.3c6.258,0 11.339,-5.064 11.339,-11.3c0,-6.237 -5.081,-11.3 -11.339,-11.3Z" style="fill:#d18038;"/>
    <ellipse cx="31.729" cy="31.87" rx="11.339" ry="11.3" style="fill:none;stroke:#652501;stroke-width:2.08px;"/>
    <ellipse cx="31.729" cy="31.87" rx="20.631" ry="20.56" style="fill:none;stroke:#652501;stroke-width:0.83px;"/>
</svg>
`;

const expected = {
  tag: "svg",
  attributes: {
    width: "100%",
    height: "100%",
    viewBox: "0 0 64 64",
    version: "1.1",
    xmlns: "http://www.w3.org/2000/svg",
    "xmlns:xlink": "http://www.w3.org/1999/xlink",
    "xml:space": "preserve",
    "xmlns:serif": "http://www.serif.com/",
    style:
      "fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;",
  },
  children: [
    {
      tag: "path",
      attributes: {
        d: "M31.729,8.08c13.175,0 23.872,10.66 23.872,23.79c0,13.13 -10.697,23.79 -23.872,23.79c-13.175,0 -23.872,-10.66 -23.872,-23.79c0,-13.13 10.697,-23.79 23.872,-23.79Zm-0,3.23c-11.387,0 -20.631,9.213 -20.631,20.56c0,11.348 9.244,20.56 20.631,20.56c11.387,0 20.631,-9.213 20.631,-20.56c0,-11.348 -9.244,-20.56 -20.631,-20.56Z",
        style: "fill:#d79e6a;",
      },
      children: [],
    },
    {
      tag: "ellipse",
      attributes: {
        cx: "31.729",
        cy: "31.87",
        rx: "23.872",
        ry: "23.79",
        style: "fill:none;stroke:#652501;stroke-width:0.83px;",
      },
      children: [],
    },
    {
      tag: "g",
      attributes: { id: "Teeth" },
      children: [
        {
          tag: "g",
          attributes: { id: "Tooth-8", "serif:id": "Tooth 8" },
          children: [
            {
              tag: "path",
              attributes: {
                d: "M2,26.629l2.903,0.325l0,6.111l-2.903,0.212l0,-6.647Z",
                style: "fill:#d18038;stroke:#652501;stroke-width:0.83px;",
              },
              children: [],
            },
            {
              tag: "path",
              attributes: {
                d: "M11.899,26.756l-0.042,7.268l-6.953,-0.96l0,-6.111l6.996,-0.198Z",
                style: "fill:#d18038;stroke:#652501;stroke-width:0.83px;",
              },
              children: [],
            },
            {
              tag: "path",
              attributes: {
                d: "M2,26.629l5.778,-0.663l4.121,0.79l-6.996,0.198l-2.903,-0.325Z",
                style: "fill:#d18038;stroke:#652501;stroke-width:0.83px;",
              },
              children: [],
            },
            {
              tag: "path",
              attributes: {
                d: "M8.245,35.168l-6.245,-1.891l2.903,-0.212l6.953,0.96l-3.611,1.143Z",
                style: "fill:#d18038;stroke:#652501;stroke-width:0.83px;",
              },
              children: [],
            },
          ],
        },
        {
          tag: "g",
          attributes: { id: "Tooth-7", "serif:id": "Tooth 7" },
          children: [
            {
              tag: "path",
              attributes: {
                d: "M14.028,42.137l5.346,5.451l-5.346,4.427l-4.602,-4.815l4.602,-5.063Z",
                style: "fill:#d18038;stroke:#652501;stroke-width:0.83px;",
              },
              children: [],
            },
            {
              tag: "path",
              attributes: {
                d: "M7.053,49.264l3.877,-5.275l3.098,-1.852l-4.602,5.063l-2.372,2.064Z",
                style: "fill:#d18038;stroke:#652501;stroke-width:0.83px;",
              },
              children: [],
            },
            {
              tag: "path",
              attributes: {
                d: "M7.053,49.264l2.372,-2.064l4.602,4.815l-2.655,2.118l-4.319,-4.869Z",
                style: "fill:#d18038;stroke:#652501;stroke-width:0.83px;",
              },
              children: [],
            },
            {
              tag: "path",
              attributes: {
                d: "M19.374,47.588l-2.407,3.899l-5.594,2.646l2.655,-2.118l5.346,-4.427Z",
                style: "fill:#d18038;stroke:#652501;stroke-width:0.83px;",
              },
              children: [],
            },
          ],
        },
        {
          tag: "g",
          attributes: { id: "Tooth-6", "serif:id": "Tooth 6" },
          children: [
            {
              tag: "path",
              attributes: {
                d: "M26.235,51.839l7.895,0.176l-0.566,6.757l-6.939,0l-0.389,-6.933Z",
                style: "fill:#d18038;stroke:#652501;stroke-width:0.83px;",
              },
              children: [],
            },
            {
              tag: "path",
              attributes: {
                d: "M26.624,62l0,-3.228l6.939,0l-0.159,3.228l-6.78,0Z",
                style: "fill:#d18038;stroke:#652501;stroke-width:0.83px;",
              },
              children: [],
            },
            {
              tag: "path",
              attributes: {
                d: "M34.13,52.015l0.655,4.71l-1.381,5.275l0.159,-3.228l0.566,-6.757Z",
                style: "fill:#d18038;stroke:#652501;stroke-width:0.83px;",
              },
              children: [],
            },
            {
              tag: "path",
              attributes: {
                d: "M25.544,55.737l0.69,-3.899l0.389,6.933l0,3.228l-1.08,-6.263Z",
                style: "fill:#d18038;stroke:#652501;stroke-width:0.83px;",
              },
              children: [],
            },
          ],
        },
        {
          tag: "g",
          attributes: { id: "Tooth-5", "serif:id": "Tooth 5" },
          children: [
            {
              tag: "path",
              attributes: {
                d: "M42.279,49.576l5.481,-4.7l4.291,4.954l-4.886,4.77l-4.886,-5.024Z",
                style: "fill:#d18038;stroke:#652501;stroke-width:0.83px;",
              },
              children: [],
            },
            {
              tag: "path",
              attributes: {
                d: "M47.76,44.876l3.144,1.849l3.13,5.49l-1.983,-2.385l-4.291,-4.954Z",
                style: "fill:#d18038;stroke:#652501;stroke-width:0.83px;",
              },
              children: [],
            },
            {
              tag: "path",
              attributes: {
                d: "M48.907,56.675l-1.742,-2.075l4.886,-4.77l1.983,2.385l-5.126,4.46Z",
                style: "fill:#d18038;stroke:#652501;stroke-width:0.83px;",
              },
              children: [],
            },
            {
              tag: "path",
              attributes: {
                d: "M48.907,56.675l-5.353,-3.669l-1.275,-3.429l4.886,5.024l1.742,2.075Z",
                style: "fill:#d18038;stroke:#652501;stroke-width:0.83px;",
              },
              children: [],
            },
          ],
        },
        {
          tag: "g",
          attributes: { id: "Tooth-4", "serif:id": "Tooth 4" },
          children: [
            {
              tag: "path",
              attributes: {
                d: "M56.052,29.299l5.948,1.389l-3.014,-0.158l-6.922,-1.174l3.988,-0.056Z",
                style: "fill:#d18038;stroke:#652501;stroke-width:0.83px;",
              },
              children: [],
            },
            {
              tag: "path",
              attributes: {
                d: "M52.064,29.355l6.922,1.174l0,6.661l-7.171,0.271l0.249,-8.106Z",
                style: "fill:#d18038;stroke:#652501;stroke-width:0.83px;",
              },
              children: [],
            },
            {
              tag: "path",
              attributes: {
                d: "M62,30.688l-0.306,6.842l-2.708,-0.339l0,-6.661l3.014,0.158Z",
                style: "fill:#d18038;stroke:#652501;stroke-width:0.83px;",
              },
              children: [],
            },
            {
              tag: "path",
              attributes: {
                d: "M51.815,37.462l7.171,-0.271l2.708,0.339l-5.891,0.644l-3.988,-0.711Z",
                style: "fill:#d18038;stroke:#652501;stroke-width:0.83px;",
              },
              children: [],
            },
          ],
        },
        {
          tag: "g",
          attributes: { id: "Tooth-3", "serif:id": "Tooth 3" },
          children: [
            {
              tag: "path",
              attributes: {
                d: "M44.619,16.081l2.089,-2.928l5.443,-3.211l-1.974,2.205l-5.558,3.934l5.328,5.381l4.408,-4.781l-4.178,-4.534l1.974,-2.205l4.47,5.01l-2.235,1.729l2.235,-1.729l-3.593,4.869l-3.08,1.641",
                style: "fill:#d18038;stroke:#652501;stroke-width:0.83px;",
              },
              children: [],
            },
            {
              tag: "path",
              attributes: {
                d: "M44.619,16.081l5.558,-3.934l4.178,4.534l-4.408,4.781l-5.328,-5.381Z",
                style: "fill:#d18038;stroke:#652501;stroke-width:0.83px;",
              },
              children: [],
            },
          ],
        },
        {
          tag: "g",
          attributes: { id: "Tooth-2", "serif:id": "Tooth 2" },
          children: [
            {
              tag: "path",
              attributes: {
                d: "M37.49,2.159l-0.726,2.84l-6.851,-0.265l0.885,-2.734l6.691,0.159Z",
                style: "fill:#d18038;stroke:#652501;stroke-width:0.83px;",
              },
              children: [],
            },
            {
              tag: "path",
              attributes: {
                d: "M29.913,4.734l6.851,0.265l0.354,7.127l-8.037,0.159l0.832,-7.55Z",
                style: "fill:#d18038;stroke:#652501;stroke-width:0.83px;",
              },
              children: [],
            },
            {
              tag: "path",
              attributes: {
                d: "M37.932,8.563l-0.814,3.564l-0.354,-7.127l0.726,-2.84l0.443,6.404Z",
                style: "fill:#d18038;stroke:#652501;stroke-width:0.83px;",
              },
              children: [],
            },
          ],
        },
        {
          tag: "g",
          attributes: { id: "Tooth-1", "serif:id": "Tooth 1" },
          children: [
            {
              tag: "path",
              attributes: {
                d: "M14.926,7.269l-5.042,4.375l1.6,2.78l5.183,-4.319l-1.742,-2.837Z",
                style:
                  "fill:#d18038;stroke:#652501;stroke-width:0.83px;stroke-linecap:butt;stroke-miterlimit:2;",
              },
              children: [],
            },
            {
              tag: "path",
              attributes: {
                d: "M11.485,14.424l4.263,4.996l5.746,-5.14l-4.826,-4.175l-5.183,4.319Z",
                style:
                  "fill:#d18038;stroke:#652501;stroke-width:0.83px;stroke-linecap:butt;stroke-miterlimit:2;",
              },
              children: [],
            },
            {
              tag: "path",
              attributes: {
                d: "M21.494,14.28l-4.826,-4.175l-1.742,-2.837l4.687,3.832l1.88,3.18Z",
                style:
                  "fill:#d18038;stroke:#652501;stroke-width:0.83px;stroke-linecap:butt;stroke-miterlimit:2;",
              },
              children: [],
            },
          ],
        },
      ],
    },
    {
      tag: "path",
      attributes: {
        d: "M31.729,11.309c11.387,0 20.631,9.213 20.631,20.56c0,11.348 -9.244,20.56 -20.631,20.56c-11.387,0 -20.631,-9.213 -20.631,-20.56c0,-11.348 9.244,-20.56 20.631,-20.56Zm0,9.26c-6.258,0 -11.339,5.064 -11.339,11.3c0,6.237 5.081,11.3 11.339,11.3c6.258,0 11.339,-5.064 11.339,-11.3c0,-6.237 -5.081,-11.3 -11.339,-11.3Z",
        style: "fill:#d18038;",
      },
      children: [],
    },
    {
      tag: "ellipse",
      attributes: {
        cx: "31.729",
        cy: "31.87",
        rx: "11.339",
        ry: "11.3",
        style: "fill:none;stroke:#652501;stroke-width:2.08px;",
      },
      children: [],
    },
    {
      tag: "ellipse",
      attributes: {
        cx: "31.729",
        cy: "31.87",
        rx: "20.631",
        ry: "20.56",
        style: "fill:none;stroke:#652501;stroke-width:0.83px;",
      },
      children: [],
    },
  ],
} satisfies SimpleSVGElement;

describe("Parse SVG", () => {
  test("Factorio Logo", () => {
    expect(parseSimpleSVG(input)).to.deep.equal(expected);
  });
});
