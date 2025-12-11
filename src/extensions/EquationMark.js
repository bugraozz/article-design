import { Mark } from "@tiptap/core";

export default Mark.create({
  name: "equationmark",

  addAttributes() {
    return {
      latex: {
        default: "",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[class~="equation-code"]',
        getAttrs: (element) => ({
          latex: element.getAttribute("data-latex") || element.textContent,
        }),
      },
    ];
  },

  renderHTML({ mark }) {
    const latex = mark.attrs.latex || "";
    return [
      "span",
      {
        class: "equation-code",
        "data-latex": latex,
        style:
          "background-color: #e8eef7; padding: 2px 4px; border-left: 3px solid #3b82f6; color: #1e40af; font-family: monospace;",
      },
      latex, // Content olarak LaTeX'i göster
    ];
  },
});
