import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { javascript } from '@codemirror/lang-javascript';
import { java } from '@codemirror/lang-java';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { rust } from '@codemirror/lang-rust';
import { php } from '@codemirror/lang-php';
import { StreamLanguage } from '@codemirror/language';
import { go } from '@codemirror/legacy-modes/mode/go';
import { ruby } from '@codemirror/legacy-modes/mode/ruby';
import { csharp } from '@codemirror/legacy-modes/mode/clike';
import { remoteCursorsField, updateCursors } from '../remoteCursors';

// sorry it's just a lot of languages
// TODO figure out Monaco's way of syncing code

const getLanguageExtension = (language) => {
  switch (language) {
    case 'javascript':
      return javascript();
    case 'typescript':
      return javascript({ typescript: true });
    case 'java':
      return java();
    case 'python':
      return python();
    case 'c':
    case 'cpp':
      return cpp();
    case 'rust':
      return rust();
    case 'php':
      return php();
    case 'go':
      return StreamLanguage.define(go);
    case 'ruby':
      return StreamLanguage.define(ruby);
    case 'csharp':
      return StreamLanguage.define(csharp);
    default:
      return javascript();
  }
};

const Editor = forwardRef(({ language, code, onChange, onCursorChange }, ref) => {
  const editorContainerRef = useRef(null);
  const editorViewRef = useRef(null);
  
  // Update initialCode whenever code prop changes (for language changes)
  const initialCodeRef = useRef(code);
  initialCodeRef.current = code;

  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    updateRemoteCursors: (cursors) => {
      if (editorViewRef.current) {
        editorViewRef.current.dispatch({
          effects: updateCursors.of(cursors),
        });
      }
    },
    // Method to update content from remote changes only
    setContent: (newCode) => {
      if (editorViewRef.current) {
        const currentContent = editorViewRef.current.state.doc.toString();
        if (newCode !== currentContent) {
          const cursorPos = editorViewRef.current.state.selection.main.head;
          editorViewRef.current.dispatch({
            changes: {
              from: 0,
              to: currentContent.length,
              insert: newCode,
            },
            selection: { anchor: Math.min(cursorPos, newCode.length) },
          });
        }
      }
    },
  }));

  useEffect(() => {
    if (!editorContainerRef.current) return;

    // the listener for changes in the editor
    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const value = update.state.doc.toString();
        onChange(value);
      }
      // Emit cursor position changes
      if (update.selectionSet && onCursorChange) {
        const pos = update.state.selection.main.head;
        onCursorChange(pos);
      }
    });

    const state = EditorState.create({
      doc: initialCodeRef.current,
      extensions: [
        basicSetup,
        oneDark,
        getLanguageExtension(language),
        updateListener,
        remoteCursorsField, // Add remote cursors support
        EditorView.theme({
          '&': { height: '100%' },
          '.cm-scroller': { overflow: 'auto' },
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorContainerRef.current,
    });

    editorViewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [language]);

  return (
    <div
      ref={editorContainerRef}
      className="h-full w-full"
      style={{ height: '100%' }}
    />
  );
});

export default Editor;
