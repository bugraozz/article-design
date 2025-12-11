import React, { useRef, useEffect, useState } from "react";

export default function SimpleContentEditor({
  html,
  isEditing,
  onHtmlChange,
  onEditorCreate,
  id,
}) {
  const divRef = useRef(null);
  const [isComposing, setIsComposing] = useState(false);

  useEffect(() => {
    if (divRef.current && !isComposing) {
      divRef.current.innerHTML = html;
    }
  }, [html, isComposing]);

  useEffect(() => {
    if (isEditing && divRef.current) {
      divRef.current.focus();
    }
  }, [isEditing]);

  const handleInput = () => {
    if (divRef.current) {
      const newHtml = divRef.current.innerHTML;
      console.log("📝 ContentEditable HTML updated:", newHtml);
      onHtmlChange?.(newHtml);
    }
  };

  const handleEditorCreate = () => {
    if (divRef.current && onEditorCreate) {
      // Simulate editor object
      const mockEditor = {
        getHTML: () => divRef.current.innerHTML,
        setContent: (html) => {
          divRef.current.innerHTML = html;
        },
        commands: {
          insertContent: (html) => {
            if (divRef.current) {
              const sel = window.getSelection();
              if (sel.rangeCount > 0) {
                const range = sel.getRangeAt(0);
                const fragment = new DOMParser().parseFromString(html, "text/html").body;
                range.insertNode(fragment.firstChild);
                range.collapse(false);
              }
            }
          },
        },
      };
      onEditorCreate?.(mockEditor);
    }
  };

  useEffect(() => {
    handleEditorCreate();
  }, [onEditorCreate, id]);

  return (
    <div
      ref={divRef}
      contentEditable={isEditing}
      suppressContentEditableWarning
      onInput={handleInput}
      onCompositionStart={() => setIsComposing(true)}
      onCompositionEnd={() => setIsComposing(false)}
      style={{
        outline: isEditing ? "2px solid #3b82f6" : "1px dashed rgba(59, 130, 246, 0.3)",
        borderRadius: "4px",
        padding: "8px",
        backgroundColor: isEditing ? "rgba(59, 130, 246, 0.02)" : "transparent",
        minHeight: "30px",
        wordWrap: "break-word",
        whiteSpace: "pre-wrap",
      }}
    />
  );
}
