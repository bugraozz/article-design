// src/extensions/DraggableResizableTable.js
import { Table } from '@tiptap/extension-table';

export const DraggableResizableTable = Table.extend({
  addNodeView() {
    return ({ node, getPos, editor }) => {
      // Ana container
      const container = document.createElement('div');
      container.className = 'draggable-table-wrapper';
      container.style.cssText = `
        position: relative;
        display: inline-block;
        margin: 1em auto;
        cursor: move;
        border: 2px solid transparent;
        padding: 4px;
        transition: border-color 0.2s;
      `;

      // İçerik wrapper
      const content = document.createElement('div');
      content.className = 'table-content';
      content.style.cssText = `
        position: relative;
        overflow: visible;
      `;

      // Tablo için contentDOM
      const contentDOM = document.createElement('table');
      contentDOM.className = 'tiptap-table';
      
      content.appendChild(contentDOM);
      container.appendChild(content);

      // Hover efekti
      container.addEventListener('mouseenter', () => {
        container.style.borderColor = '#3b82f6';
      });

      container.addEventListener('mouseleave', () => {
        container.style.borderColor = 'transparent';
      });

      // Resize handle'ları
      const positions = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'];
      const handles = {};

      positions.forEach(pos => {
        const handle = document.createElement('div');
        handle.className = `resize-handle resize-handle-${pos}`;
        handle.style.cssText = `
          position: absolute;
          background: #3b82f6;
          z-index: 100;
          opacity: 0;
          transition: opacity 0.2s;
        `;

        // Köşe handle'ları
        if (pos.length === 2) {
          handle.style.width = '8px';
          handle.style.height = '8px';
          handle.style.borderRadius = '50%';
          
          if (pos.includes('n')) handle.style.top = '-4px';
          if (pos.includes('s')) handle.style.bottom = '-4px';
          if (pos.includes('w')) handle.style.left = '-4px';
          if (pos.includes('e')) handle.style.right = '-4px';
          
          if (pos === 'nw' || pos === 'se') handle.style.cursor = 'nwse-resize';
          if (pos === 'ne' || pos === 'sw') handle.style.cursor = 'nesw-resize';
        } 
        // Kenar handle'ları
        else {
          if (pos === 'n' || pos === 's') {
            handle.style.height = '4px';
            handle.style.width = '100%';
            handle.style.left = '0';
            handle.style.cursor = 'ns-resize';
            if (pos === 'n') handle.style.top = '-2px';
            if (pos === 's') handle.style.bottom = '-2px';
          } else {
            handle.style.width = '4px';
            handle.style.height = '100%';
            handle.style.top = '0';
            handle.style.cursor = 'ew-resize';
            if (pos === 'w') handle.style.left = '-2px';
            if (pos === 'e') handle.style.right = '-2px';
          }
        }

        handles[pos] = handle;
        container.appendChild(handle);
      });

      // Handle'ları göster/gizle
      container.addEventListener('mouseenter', () => {
        Object.values(handles).forEach(h => h.style.opacity = '1');
      });

      container.addEventListener('mouseleave', () => {
        Object.values(handles).forEach(h => h.style.opacity = '0');
      });

      // Resize fonksiyonelliği
      let isResizing = false;
      let startX, startY, startWidth, startHeight;

      Object.entries(handles).forEach(([pos, handle]) => {
        handle.addEventListener('mousedown', (e) => {
          e.preventDefault();
          e.stopPropagation();
          isResizing = true;
          
          startX = e.clientX;
          startY = e.clientY;
          startWidth = content.offsetWidth;
          startHeight = content.offsetHeight;

          const onMouseMove = (moveEvent) => {
            if (!isResizing) return;

            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;

            let newWidth = startWidth;
            let newHeight = startHeight;

            if (pos.includes('e')) newWidth = startWidth + deltaX;
            if (pos.includes('w')) newWidth = startWidth - deltaX;
            if (pos.includes('s')) newHeight = startHeight + deltaY;
            if (pos.includes('n')) newHeight = startHeight - deltaY;

            if (newWidth >= 100) {
              content.style.width = `${newWidth}px`;
              contentDOM.style.width = `${newWidth}px`;
            }
            if (newHeight >= 50) {
              content.style.minHeight = `${newHeight}px`;
            }
          };

          const onMouseUp = () => {
            isResizing = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
          };

          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mouseup', onMouseUp);
        });
      });

      // Sürükleme fonksiyonelliği
      let isDragging = false;
      let dragStartX, dragStartY;

      container.addEventListener('mousedown', (e) => {
        // Resize handle'a basıldıysa sürükleme yapma
        if (isResizing || e.target.classList.contains('resize-handle')) {
          return;
        }

        // Tablo içeriğine (td/th) basıldıysa sürükleme yapma
        if (e.target.tagName === 'TD' || e.target.tagName === 'TH' || e.target.closest('td, th')) {
          return;
        }

        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        container.style.cursor = 'grabbing';

        const onMouseMove = (moveEvent) => {
          if (!isDragging) return;
          
          const deltaX = moveEvent.clientX - dragStartX;
          const deltaY = moveEvent.clientY - dragStartY;

          // Tabloyu hareket ettir (margin ile)
          const currentMarginLeft = parseInt(container.style.marginLeft || '0');
          const currentMarginTop = parseInt(container.style.marginTop || '0');
          
          container.style.marginLeft = `${currentMarginLeft + deltaX}px`;
          container.style.marginTop = `${currentMarginTop + deltaY}px`;

          dragStartX = moveEvent.clientX;
          dragStartY = moveEvent.clientY;
        };

        const onMouseUp = () => {
          isDragging = false;
          container.style.cursor = 'move';
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });

      return {
        dom: container,
        contentDOM,
        update: (updatedNode) => {
          if (updatedNode.type !== node.type) return false;
          return true;
        },
        destroy: () => {
          // Cleanup
        },
      };
    };
  },
});
