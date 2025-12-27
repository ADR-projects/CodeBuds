import { Editor as MonacoEditor } from '@monaco-editor/react';

const Editor = ({ language, code, onChange }) => {
  return (
    <div className="h-full w-full">
      <MonacoEditor
        height="100%"
        language={language}
        theme="vs-dark"
        value={code}
        onChange={onChange}
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          wordWrap: 'on',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          padding: { top: 16 },
        }}
      />
    </div>
  );
};

export default Editor;
