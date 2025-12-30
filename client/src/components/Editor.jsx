import { useEffect, useRef } from 'react';
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

const Editor = ({ language, code, onChange }) => {
  const editorContainerRef = useRef(null);
  const editorViewRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    if (!editorContainerRef.current) return;
    editorRef.current = editorContainerRef.current; // do we need this.

    // the listener for changes in the editor
    const updateListener = EditorView.updateListener.of((update) => {
      console.log('Editor update:', update);
      if (update.docChanged) {
        const value = update.state.doc.toString();
        onChange(value);
      }
    });

    const state = EditorState.create({
      doc: code,
      extensions: [
        basicSetup,
        oneDark,
        getLanguageExtension(language),
        updateListener,
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

  // Update content when code prop changes externally ( we write new code)
  useEffect(() => {
    if (editorViewRef.current) {
      const currentContent = editorViewRef.current.state.doc.toString();
      if (code !== currentContent) {
        editorViewRef.current.dispatch({
          changes: {
            from: 0,
            to: currentContent.length,
            insert: code,
          },
        });
      }
    }
  }, [code]);

  return (
    <div
      ref={editorContainerRef}
      className="h-full w-full"
      style={{ height: '100%' }}
    />
  );
};

export default Editor;
