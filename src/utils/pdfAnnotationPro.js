export class AnnotationManagerPro {
  constructor() {
    this.annotations = [];
    this.history = [];
    this.historyIndex = -1;
    this.currentTool = null;
    this.currentColor = { r: 1, g: 1, b: 0 };
    this.listeners = [];
    this.selectedAnnotation = null;
  }

  setTool(tool) {
    this.currentTool = tool;
    this.notifyListeners();
  }

  getCurrentTool() {
    return this.currentTool;
  }

  setColor(color) {
    this.currentColor = color;
    this.notifyListeners();
  }

  getCurrentColor() {
    return this.currentColor;
  }

  addAnnotation(annotation) {
    const newAnnotation = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      ...annotation,
    };
    
    this.annotations.push(newAnnotation);
    this.saveToHistory();
    this.notifyListeners();
    return newAnnotation;
  }

  updateAnnotation(id, updates) {
    const index = this.annotations.findIndex(a => a.id === id);
    if (index !== -1) {
      this.annotations[index] = { ...this.annotations[index], ...updates };
      this.saveToHistory();
      this.notifyListeners();
    }
  }

  removeAnnotation(id) {
    this.annotations = this.annotations.filter(a => a.id !== id);
    if (this.selectedAnnotation?.id === id) {
      this.selectedAnnotation = null;
    }
    this.saveToHistory();
    this.notifyListeners();
  }

  selectAnnotation(id) {
    this.selectedAnnotation = this.annotations.find(a => a.id === id) || null;
    this.notifyListeners();
  }

  getSelectedAnnotation() {
    return this.selectedAnnotation;
  }

  getAnnotations(pageIndex = null) {
    if (pageIndex !== null) {
      return this.annotations.filter(a => a.pageIndex === pageIndex);
    }
    return this.annotations;
  }

  clearAnnotations() {
    this.annotations = [];
    this.selectedAnnotation = null;
    this.saveToHistory();
    this.notifyListeners();
  }

  saveToHistory() {
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(JSON.parse(JSON.stringify(this.annotations)));
    this.historyIndex++;
    
    if (this.history.length > 50) {
      this.history.shift();
      this.historyIndex--;
    }
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.annotations = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
      this.notifyListeners();
      return true;
    }
    return false;
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.annotations = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
      this.notifyListeners();
      return true;
    }
    return false;
  }

  canUndo() {
    return this.historyIndex > 0;
  }

  canRedo() {
    return this.historyIndex < this.history.length - 1;
  }

  onChange(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener({
      annotations: this.annotations,
      selectedAnnotation: this.selectedAnnotation,
      currentTool: this.currentTool,
      currentColor: this.currentColor,
    }));
  }

  createHighlight(pageIndex, x, y, width, height, color = null) {
    return {
      type: 'highlight',
      pageIndex,
      x,
      y,
      width,
      height,
      color: color || this.currentColor,
      opacity: 0.4,
    };
  }

  createTextAnnotation(pageIndex, x, y, text, fontSize = 14, color = null) {
    return {
      type: 'text',
      pageIndex,
      x,
      y,
      text,
      fontSize,
      color: color || { r: 0, g: 0, b: 0 },
    };
  }

  createDrawing(pageIndex, points, color = null, lineWidth = 2) {
    return {
      type: 'drawing',
      pageIndex,
      points,
      color: color || this.currentColor,
      lineWidth,
    };
  }

  createStickyNote(pageIndex, x, y, text, color = null) {
    return {
      type: 'sticky',
      pageIndex,
      x,
      y,
      text,
      color: color || { r: 1, g: 0.9, b: 0.2 },
      width: 200,
      height: 150,
    };
  }
}

export const ANNOTATION_TOOLS = {
  NONE: 'none',
  HIGHLIGHT: 'highlight',
  TEXT: 'text',
  DRAW: 'draw',
  STICKY: 'sticky',
  REDACT: 'redact',
  ERASER: 'eraser',
};

export const PRESET_COLORS = [
  { name: 'Yellow', value: { r: 1, g: 1, b: 0 }, hex: '#FFFF00' },
  { name: 'Green', value: { r: 0, g: 1, b: 0 }, hex: '#00FF00' },
  { name: 'Blue', value: { r: 0, g: 0.5, b: 1 }, hex: '#0080FF' },
  { name: 'Red', value: { r: 1, g: 0, b: 0 }, hex: '#FF0000' },
  { name: 'Orange', value: { r: 1, g: 0.5, b: 0 }, hex: '#FF8000' },
  { name: 'Pink', value: { r: 1, g: 0.4, b: 0.7 }, hex: '#FF66B2' },
  { name: 'Purple', value: { r: 0.5, g: 0, b: 1 }, hex: '#8000FF' },
  { name: 'Cyan', value: { r: 0, g: 1, b: 1 }, hex: '#00FFFF' },
];
