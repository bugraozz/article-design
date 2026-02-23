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
        parseHTML: element => {
          // Önce style.color'dan, sonra data-color'dan oku
          const styleColor = element.style.color;
          const dataColor = element.getAttribute('data-color');
          return styleColor || dataColor || null;
        },
        renderHTML: attributes => {
          if (!attributes.color) return {};
          // Her zaman inline style ekle - bu HTML'de görünür kalmasını sağlar
          return {
            'data-color': attributes.color,
            style: `color: ${attributes.color} !important;`,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[style*="color"]',
        getAttrs: element => {
          const color = element.style.color;
          return color ? { color } : null;
        },
      },
      {
        tag: 'span[data-color]',
        getAttrs: element => {
          const color = element.getAttribute('data-color');
          return color ? { color } : null;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    // span oluştur ve öznitelikleri ekle
    return ['span', { ...HTMLAttributes }, 0];
  },

  addCommands() {
    return {
      setInlineColor: (color) => ({ commands }) => {
        return commands.setMark(this.name, { color });
      },
      unsetInlineColor: () => ({ commands }) => {
        return commands.unsetMark(this.name);
      },
      toggleInlineColor: (color) => ({ commands }) => {
        return commands.toggleMark(this.name, { color });
      },
    };
  },
});

export default InlineColor;
