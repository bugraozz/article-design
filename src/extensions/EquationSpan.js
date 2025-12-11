import { Extension } from "@tiptap/core";

export default Extension.create({
  name: "equationSpan",

  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          class: {
            default: null,
            parseHTML: (element) => element.getAttribute("class"),
            renderHTML: (attributes) => {
              if (!attributes.class) {
                return {};
              }
              return {
                class: attributes.class,
              };
            },
          },
          dataLatex: {
            default: null,
            parseHTML: (element) => element.getAttribute("data-latex"),
            renderHTML: (attributes) => {
              if (!attributes.dataLatex) {
                return {};
              }
              return {
                "data-latex": attributes.dataLatex,
              };
            },
          },
        },
      },
    ];
  },

  addPasteRules() {
    return [
      {
        find: /equation-code/g,
        handler: ({ match, chain }) => {
          return chain()
            .insertContent({
              type: "text",
              marks: [
                {
                  type: "textStyle",
                  attrs: {
                    class: "equation-code",
                  },
                },
              ],
            })
            .run();
        },
      },
    ];
  },
});
