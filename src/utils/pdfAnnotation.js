export class AnnotationManager {
  constructor() {
    this.annotations = [];
    this.currentTool = null;
    this.listeners = [];
  }

  setTool(tool) {
    this.currentTool = tool;
    this.notifyListeners();
  }

  getCurrentTool() {
    return this.currentTool;
  }

  addAnnotation(annotation) {
    this.annotations.push({
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      ...annotation,
    });
    this.notifyListeners();
  }

  removeAnnotation(id) {
    this.annotations = this.annotations.filter(a => a.id !== id);
    this.notifyListeners();
  }

  getAnnotations(pageIndex = null) {
    if (pageIndex !== null) {
      return this.annotations.filter(a => a.pageIndex === pageIndex);
    }
    return this.annotations;
  }

  clearAnnotations() {
    this.annotations = [];
    this.notifyListeners();
  }

  onChange(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.annotations));
  }

  createHighlight(pageIndex, x, y, width, height, color = { r: 1, g: 1, b: 0 }) {
    return {
      type: 'highlight',
      pageIndex,
      x,
      y,
      width,
      height,
      color,
    };
  }

  createTextAnnotation(pageIndex, x, y, text, fontSize = 12, color = { r: 0, g: 0, b: 0 }) {
    return {
      type: 'text',
      pageIndex,
      x,
      y,
      text,
      fontSize,
      color,
    };
  }

  createDrawing(pageIndex, points, color = { r: 0, g: 0, b: 0 }, lineWidth = 2) {
    return {
      type: 'drawing',
      pageIndex,
      points,
      color,
      lineWidth,
    };
  }
}

export const ANNOTATION_TOOLS = {
  NONE: 'none',
  HIGHLIGHT: 'highlight',
  TEXT: 'text',
  DRAW: 'draw',
  REDACT: 'redact',
};
