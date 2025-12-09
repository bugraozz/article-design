import { Mark } from "@tiptap/core";

export const InlineColor = Mark.create({
  name: "inlineColor",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-color") || element.style.color,
        renderHTML: (attributes) => {
          if (!attributes.color) {
            return {};
          }

          return {
            "data-color": attributes.color,
            style: `color: ${attributes.color}`,
            class: "inline-color",
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-color]",
        getAttrs: (node) => ({
          color: node.getAttribute("data-color"),
        }),
      },
      {
        tag: "span[style*=color]",
        getAttrs: (node) => {
          const match = node.style.color;
          return match ? { color: match } : false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", HTMLAttributes, 0];
  },

  addCommands() {
    return {
      setInlineColor:
        (color) =>
        ({ commands }) => {
          return commands.setMark(this.name, { color });
        },
      toggleInlineColor:
        (color) =>
        ({ commands }) => {
          return commands.toggleMark(this.name, { color });
        },
      unsetInlineColor:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});

export default InlineColor;
