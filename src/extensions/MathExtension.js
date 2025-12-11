import { Node, mergeAttributes } from '@tiptap/core';
import katex from 'katex';

export const MathInline = Node.create({
  name: 'mathInline',

  group: 'inline',

  inline: true,

  atom: true,

  addAttributes() {
    return {
      latex: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span.math-inline[data-latex]',
        getAttrs: (dom) => ({
          latex: dom.getAttribute('data-latex'),
        }),
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const latex = node.attrs.latex;
    let renderedHTML = '';

    try {
      renderedHTML = katex.renderToString(latex, {
        throwOnError: false,
        displayMode: false,
        output: 'html',
        trust: true,
        strict: false,
      });
    } catch (error) {
      console.error('KaTeX render error:', error);
      renderedHTML = `$${latex}$`;
    }

    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        class: 'math-inline katex-rendered',
        'data-latex': latex,
        contenteditable: 'false',
      }),
      ['span', { innerHTML: renderedHTML }],
    ];
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const dom = document.createElement('span');
      dom.className = 'math-inline katex-rendered';
      dom.setAttribute('data-latex', node.attrs.latex);
      dom.contentEditable = 'false';
      
      try {
        const rendered = katex.renderToString(node.attrs.latex, {
          throwOnError: false,
          displayMode: false,
          output: 'html',
          trust: true,
          strict: false,
        });
        dom.innerHTML = rendered;
      } catch (error) {
        dom.textContent = `$${node.attrs.latex}$`;
      }

      let editPopup = null;
      let contextMenu = null;

      // Right click - Context Menu
      dom.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Önceki menüyü kapat
        if (contextMenu) {
          contextMenu.remove();
          contextMenu = null;
        }

        // Context menu oluştur
        contextMenu = document.createElement('div');
        contextMenu.style.cssText = `
          position: fixed;
          z-index: 10001;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          padding: 4px;
          min-width: 150px;
          left: ${e.clientX}px;
          top: ${e.clientY}px;
        `;

        // Düzenle butonu
        const editBtn = document.createElement('button');
        editBtn.innerHTML = '✏️ Düzenle';
        editBtn.style.cssText = `
          width: 100%;
          padding: 8px 12px;
          text-align: left;
          background: none;
          border: none;
          cursor: pointer;
          border-radius: 4px;
          font-size: 13px;
        `;
        editBtn.onmouseover = () => editBtn.style.background = '#f3f4f6';
        editBtn.onmouseout = () => editBtn.style.background = 'none';
        editBtn.onclick = () => {
          contextMenu.remove();
          contextMenu = null;
          // Düzenleme popup'ını tetikle
          dom.dispatchEvent(new Event('dblclick'));
        };

        // Sil butonu
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '🗑️ Sil';
        deleteBtn.style.cssText = `
          width: 100%;
          padding: 8px 12px;
          text-align: left;
          background: none;
          border: none;
          cursor: pointer;
          border-radius: 4px;
          font-size: 13px;
          color: #dc2626;
        `;
        deleteBtn.onmouseover = () => deleteBtn.style.background = '#fee2e2';
        deleteBtn.onmouseout = () => deleteBtn.style.background = 'none';
        deleteBtn.onclick = () => {
          if (typeof getPos === 'function') {
            const pos = getPos();
            editor.commands.setNodeSelection(pos);
            editor.commands.deleteSelection();
          }
          contextMenu.remove();
          contextMenu = null;
        };

        contextMenu.appendChild(editBtn);
        contextMenu.appendChild(deleteBtn);
        document.body.appendChild(contextMenu);

        // Dışarı tıklayınca kapat
        setTimeout(() => {
          const closeMenu = (evt) => {
            if (contextMenu && !contextMenu.contains(evt.target)) {
              contextMenu.remove();
              contextMenu = null;
              document.removeEventListener('click', closeMenu);
            }
          };
          document.addEventListener('click', closeMenu);
        }, 100);
      });

      // Double click to edit - Inline Editor
      dom.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        
        // Eğer zaten açıksa kapat
        if (editPopup) {
          editPopup.remove();
          editPopup = null;
          return;
        }

        // Popup container
        editPopup = document.createElement('div');
        editPopup.className = 'math-edit-popup';
        editPopup.style.cssText = `
          position: absolute;
          z-index: 10000;
          background: white;
          border: 2px solid #3b82f6;
          border-radius: 8px;
          padding: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          min-width: 300px;
          max-width: 500px;
        `;

        // Input field
        const input = document.createElement('textarea');
        input.value = node.attrs.latex;
        input.style.cssText = `
          width: 100%;
          padding: 8px;
          font-family: monospace;
          font-size: 13px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          resize: vertical;
          min-height: 60px;
          margin-bottom: 8px;
        `;

        // Preview
        const preview = document.createElement('div');
        preview.style.cssText = `
          padding: 12px;
          background: #f9fafb;
          border-radius: 4px;
          margin-bottom: 8px;
          text-align: center;
          min-height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        `;

        const updatePreview = () => {
          try {
            const rendered = katex.renderToString(input.value, {
              throwOnError: false,
              displayMode: false,
            });
            preview.innerHTML = rendered;
          } catch (error) {
            preview.textContent = 'Hatalı LaTeX';
          }
        };

        input.addEventListener('input', updatePreview);
        updatePreview();

        // Buttons
        const buttons = document.createElement('div');
        buttons.style.cssText = 'display: flex; gap: 8px; justify-content: flex-end;';

        const saveBtn = document.createElement('button');
        saveBtn.textContent = '✓ Kaydet';
        saveBtn.style.cssText = `
          padding: 6px 12px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        `;
        saveBtn.onclick = () => {
          if (typeof getPos === 'function') {
            const pos = getPos();
            editor.commands.setNodeSelection(pos);
            editor.commands.updateAttributes('mathInline', { latex: input.value });
          }
          editPopup.remove();
          editPopup = null;
        };

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = '✗ İptal';
        cancelBtn.style.cssText = `
          padding: 6px 12px;
          background: #6b7280;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        `;
        cancelBtn.onclick = () => {
          editPopup.remove();
          editPopup = null;
        };

        buttons.appendChild(cancelBtn);
        buttons.appendChild(saveBtn);

        editPopup.appendChild(input);
        editPopup.appendChild(preview);
        editPopup.appendChild(buttons);

        // Position popup above the math element
        const rect = dom.getBoundingClientRect();
        editPopup.style.left = `${rect.left}px`;
        editPopup.style.top = `${rect.top - 160}px`;

        document.body.appendChild(editPopup);
        input.focus();
        input.select();

        // Close on click outside
        setTimeout(() => {
          const closeOnClickOutside = (e) => {
            if (editPopup && !editPopup.contains(e.target)) {
              editPopup.remove();
              editPopup = null;
              document.removeEventListener('click', closeOnClickOutside);
            }
          };
          document.addEventListener('click', closeOnClickOutside);
        }, 100);
      });

      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type.name !== 'mathInline') return false;
          
          dom.setAttribute('data-latex', updatedNode.attrs.latex);
          try {
            const rendered = katex.renderToString(updatedNode.attrs.latex, {
              throwOnError: false,
              displayMode: false,
              output: 'html',
              trust: true,
              strict: false,
            });
            dom.innerHTML = rendered;
          } catch (error) {
            dom.textContent = `$${updatedNode.attrs.latex}$`;
          }
          
          return true;
        },
        destroy: () => {
          if (editPopup) {
            editPopup.remove();
          }
          if (contextMenu) {
            contextMenu.remove();
          }
        },
      };
    };
  },
});

export const MathBlock = Node.create({
  name: 'mathBlock',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      latex: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div.math-block[data-latex]',
        getAttrs: (dom) => ({
          latex: dom.getAttribute('data-latex'),
        }),
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const latex = node.attrs.latex;
    let renderedHTML = '';

    try {
      renderedHTML = katex.renderToString(latex, {
        throwOnError: false,
        displayMode: true,
        output: 'html',
        trust: true,
        strict: false,
      });
    } catch (error) {
      console.error('KaTeX render error:', error);
      renderedHTML = `$$${latex}$$`;
    }

    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        class: 'math-block katex-rendered',
        'data-latex': latex,
        contenteditable: 'false',
      }),
      ['div', { innerHTML: renderedHTML }],
    ];
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const dom = document.createElement('div');
      dom.className = 'math-block katex-rendered';
      dom.setAttribute('data-latex', node.attrs.latex);
      dom.contentEditable = 'false';
      
      try {
        const rendered = katex.renderToString(node.attrs.latex, {
          throwOnError: false,
          displayMode: true,
          output: 'html',
          trust: true,
          strict: false,
        });
        dom.innerHTML = rendered;
      } catch (error) {
        dom.textContent = `$$${node.attrs.latex}$$`;
      }

      let editPopup = null;
      let contextMenu = null;

      // Right click - Context Menu
      dom.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (contextMenu) {
          contextMenu.remove();
          contextMenu = null;
        }

        contextMenu = document.createElement('div');
        contextMenu.style.cssText = `
          position: fixed;
          z-index: 10001;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          padding: 4px;
          min-width: 150px;
          left: ${e.clientX}px;
          top: ${e.clientY}px;
        `;

        const editBtn = document.createElement('button');
        editBtn.innerHTML = '✏️ Düzenle';
        editBtn.style.cssText = `
          width: 100%;
          padding: 8px 12px;
          text-align: left;
          background: none;
          border: none;
          cursor: pointer;
          border-radius: 4px;
          font-size: 13px;
        `;
        editBtn.onmouseover = () => editBtn.style.background = '#f3f4f6';
        editBtn.onmouseout = () => editBtn.style.background = 'none';
        editBtn.onclick = () => {
          contextMenu.remove();
          contextMenu = null;
          dom.dispatchEvent(new Event('dblclick'));
        };

        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '🗑️ Sil';
        deleteBtn.style.cssText = `
          width: 100%;
          padding: 8px 12px;
          text-align: left;
          background: none;
          border: none;
          cursor: pointer;
          border-radius: 4px;
          font-size: 13px;
          color: #dc2626;
        `;
        deleteBtn.onmouseover = () => deleteBtn.style.background = '#fee2e2';
        deleteBtn.onmouseout = () => deleteBtn.style.background = 'none';
        deleteBtn.onclick = () => {
          if (typeof getPos === 'function') {
            const pos = getPos();
            editor.commands.setNodeSelection(pos);
            editor.commands.deleteSelection();
          }
          contextMenu.remove();
          contextMenu = null;
        };

        contextMenu.appendChild(editBtn);
        contextMenu.appendChild(deleteBtn);
        document.body.appendChild(contextMenu);

        setTimeout(() => {
          const closeMenu = (evt) => {
            if (contextMenu && !contextMenu.contains(evt.target)) {
              contextMenu.remove();
              contextMenu = null;
              document.removeEventListener('click', closeMenu);
            }
          };
          document.addEventListener('click', closeMenu);
        }, 100);
      });

      // Double click to edit - Inline Editor
      dom.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        
        if (editPopup) {
          editPopup.remove();
          editPopup = null;
          return;
        }

        editPopup = document.createElement('div');
        editPopup.className = 'math-edit-popup';
        editPopup.style.cssText = `
          position: absolute;
          z-index: 10000;
          background: white;
          border: 2px solid #8b5cf6;
          border-radius: 8px;
          padding: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          min-width: 400px;
          max-width: 600px;
        `;

        const input = document.createElement('textarea');
        input.value = node.attrs.latex;
        input.style.cssText = `
          width: 100%;
          padding: 8px;
          font-family: monospace;
          font-size: 13px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          resize: vertical;
          min-height: 80px;
          margin-bottom: 8px;
        `;

        const preview = document.createElement('div');
        preview.style.cssText = `
          padding: 16px;
          background: #f9fafb;
          border-radius: 4px;
          margin-bottom: 8px;
          text-align: center;
          min-height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
        `;

        const updatePreview = () => {
          try {
            const rendered = katex.renderToString(input.value, {
              throwOnError: false,
              displayMode: true,
            });
            preview.innerHTML = rendered;
          } catch (error) {
            preview.textContent = 'Hatalı LaTeX';
          }
        };

        input.addEventListener('input', updatePreview);
        updatePreview();

        const buttons = document.createElement('div');
        buttons.style.cssText = 'display: flex; gap: 8px; justify-content: flex-end;';

        const saveBtn = document.createElement('button');
        saveBtn.textContent = '✓ Kaydet';
        saveBtn.style.cssText = `
          padding: 6px 12px;
          background: #8b5cf6;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        `;
        saveBtn.onclick = () => {
          if (typeof getPos === 'function') {
            const pos = getPos();
            editor.commands.setNodeSelection(pos);
            editor.commands.updateAttributes('mathBlock', { latex: input.value });
          }
          editPopup.remove();
          editPopup = null;
        };

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = '✗ İptal';
        cancelBtn.style.cssText = `
          padding: 6px 12px;
          background: #6b7280;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        `;
        cancelBtn.onclick = () => {
          editPopup.remove();
          editPopup = null;
        };

        buttons.appendChild(cancelBtn);
        buttons.appendChild(saveBtn);

        editPopup.appendChild(input);
        editPopup.appendChild(preview);
        editPopup.appendChild(buttons);

        const rect = dom.getBoundingClientRect();
        editPopup.style.left = `${rect.left}px`;
        editPopup.style.top = `${rect.top - 200}px`;

        document.body.appendChild(editPopup);
        input.focus();
        input.select();

        setTimeout(() => {
          const closeOnClickOutside = (e) => {
            if (editPopup && !editPopup.contains(e.target)) {
              editPopup.remove();
              editPopup = null;
              document.removeEventListener('click', closeOnClickOutside);
            }
          };
          document.addEventListener('click', closeOnClickOutside);
        }, 100);
      });

      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type.name !== 'mathBlock') return false;
          
          dom.setAttribute('data-latex', updatedNode.attrs.latex);
          try {
            const rendered = katex.renderToString(updatedNode.attrs.latex, {
              throwOnError: false,
              displayMode: true,
              output: 'html',
              trust: true,
              strict: false,
            });
            dom.innerHTML = rendered;
          } catch (error) {
            dom.textContent = `$$${updatedNode.attrs.latex}$$`;
          }
          
          return true;
        },
        destroy: () => {
          if (editPopup) {
            editPopup.remove();
          }
          if (contextMenu) {
            contextMenu.remove();
          }
        },
      };
    };
  },
});
