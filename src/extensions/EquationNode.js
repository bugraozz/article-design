import { Node } from "@tiptap/core";

export default Node.create({
  name: "equation",
  
  group: "block",
  atom: true,  // Atomic node - içeriği edit edilemez
  draggable: true,  // Taşınabilir

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
        tag: "div[data-type='equation']",
        preserveAttributes: true,
        getAttrs: (element) => ({
          latex: element.getAttribute("data-latex") || "",
        }),
      },
    ];
  },

  renderHTML({ node }) {
    return [
      "div",
      {
        "data-type": "equation",
        "data-latex": node.attrs.latex || "",
        contentEditable: "false",
        style: "text-align: center; margin: 0.5em 0; padding: 0.5em 0; cursor: pointer; user-select: none; position: relative;",
      },
    ];
  },

  addCommands() {
    return {
      insertEquation:
        (latex) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { latex },
          });
        },
    };
  },
});
