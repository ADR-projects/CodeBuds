import { StateField, StateEffect } from '@codemirror/state';
import { Decoration, EditorView, WidgetType } from '@codemirror/view';

// Colors for different users
const CURSOR_COLORS = [
'#ae2012', // Red
'#1b998b', // Green
'#2364aa', // Blue  
'#ee9b00', // Yellow
'#7209b7', // Purple
'#bb3e03', // Orange
'#ef476f', // Pink
'#06d6a0', // Teal
];

// Effect to update remote cursors
export const updateCursors = StateEffect.define();

// Cursor widget class
class CursorWidget extends WidgetType {
  constructor(color, username) {
    super();
    this.color = color;
    this.username = username;
  }

  eq(other) {
    return other.color === this.color && other.username === this.username;
  }

  toDOM() {
    const cursor = document.createElement('span');
    cursor.className = 'remote-cursor';
    cursor.style.borderLeft = `2px solid ${this.color}`;
    cursor.style.marginLeft = '-1px';
    cursor.style.position = 'relative';
    
    // Username label
    const label = document.createElement('span');
    label.className = 'remote-cursor-label';
    label.textContent = this.username;
    label.style.position = 'absolute';
    label.style.top = '-1.4em';
    label.style.left = '0';
    label.style.backgroundColor = this.color;
    label.style.color = 'white';
    label.style.padding = '1px 4px';
    label.style.borderRadius = '3px';
    label.style.fontSize = '10px';
    label.style.whiteSpace = 'nowrap';
    cursor.appendChild(label);
    
    return cursor;
  }
}

// State field to manage remote cursors
export const remoteCursorsField = StateField.define({
  create() {
    return Decoration.none;
  },
  update(cursors, tr) {
    for (const effect of tr.effects) {
      if (effect.is(updateCursors)) {
        const decorations = effect.value.map(({ pos, color, username }) =>
          Decoration.widget({
            widget: new CursorWidget(color, username),
            side: 1,
          }).range(Math.min(pos, tr.state.doc.length))
        );
        return Decoration.set(decorations, true);
      }
    }
    return cursors.map(tr.changes);
  },
  provide: (f) => EditorView.decorations.from(f),
});

export const getColorForUser = (index) => CURSOR_COLORS[index % CURSOR_COLORS.length];