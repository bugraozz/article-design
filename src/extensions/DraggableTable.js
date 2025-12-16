// src/extensions/DraggableTable.js
import { Node, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export const DraggableTable = Node.create({
  name: 'draggableTable',
  
  group: 'block',
  
  content: 'table',
  
  isolating: true,
  
  addAttributes() {
    return {
      width: {
        default: null,
        parseHTML: element => element.style.width,
        renderHTML: attributes => {
          if (!attributes.width) return {};
          return { style: `width: ${attributes.width}` };
        },
      },
      align: {
        default: 'left',
        parseHTML: element => {
          const align = element.style.marginLeft;
          if (align === 'auto' && element.style.marginRight === 'auto') return 'center';
          if (align === 'auto') return 'right';
          return 'left';
        },
        renderHTML: attributes => {
          const { align } = attributes;
          const style = {};
          if (align === 'center') {
            style.marginLeft = 'auto';
            style.marginRight = 'auto';
          } else if (align === 'right') {
            style.marginLeft = 'auto';
            style.marginRight = '0';
          }
          return { style: Object.entries(style).map(([k, v]) => `${k}: ${v}`).join('; ') };
        },
      },
    };
  },
  
  parseHTML() {
    return [
      {
        tag: 'div[data-type="draggable-table"]',
      },
    ];
  },
  
  renderHTML({ HTMLAttributes, node }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'draggable-table',
        class: 'draggable-table-wrapper',
      }),
      0,
    ];
  },
  
  addNodeView() {
    return ({ node, getPos, editor }) => {
      const dom = document.createElement('div');
      dom.className = 'draggable-table-container';
      dom.style.position = 'relative';
      dom.style.margin = '1em 0';
      
      const wrapper = document.createElement('div');
      wrapper.className = 'draggable-table-content';
      wrapper.style.display = 'inline-block';
      wrapper.style.position = 'relative';
      
      if (node.attrs.width) {
        wrapper.style.width = node.attrs.width;
      }
      
      // Resize handle
      const resizeHandle = document.createElement('div');
      resizeHandle.className = 'table-resize-handle';
      resizeHandle.style.cssText = `
        position: absolute;
        right: -5px;
        top: 0;
        bottom: 0;
        width: 10px;
        cursor: col-resize;
        background: transparent;
        z-index: 10;
      `;
      
      let startX, startWidth;
      
      resizeHandle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        startX = e.clientX;
        startWidth = wrapper.offsetWidth;
        
        const onMouseMove = (moveEvent) => {
          const diff = moveEvent.clientX - startX;
          const newWidth = Math.max(100, startWidth + diff);
          wrapper.style.width = `${newWidth}px`;
        };
        
        const onMouseUp = () => {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
          
          // Update node attribute
          if (typeof getPos === 'function') {
            const pos = getPos();
            editor.commands.updateAttributes('draggableTable', {
              width: wrapper.style.width,
            });
          }
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });
      
      const contentDOM = document.createElement('div');
      wrapper.appendChild(contentDOM);
      wrapper.appendChild(resizeHandle);
      dom.appendChild(wrapper);
      
      return {
        dom,
        contentDOM,
        update: (updatedNode) => {
          if (updatedNode.type !== node.type) return false;
          if (updatedNode.attrs.width) {
            wrapper.style.width = updatedNode.attrs.width;
          }
          return true;
        },
      };
    };
  },
});
