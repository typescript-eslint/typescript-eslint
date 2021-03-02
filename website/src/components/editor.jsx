import React, { Suspense, lazy, useRef, useEffect, useCallback } from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import useThemeContext from '@theme/hooks/useThemeContext';
import { loadLinter } from './lib/linter';
import styles from './styles.module.css';

const MonacoEditor = lazy(() => import('react-monaco-editor'));

const defaultOptions = {
  minimap: { enabled: false },
  fontSize: '13px',
  wordWrap: 'off',
  scrollBeyondLastLine: false,
  smoothScrolling: true,
  fontFamily: "Menlo, Monaco, Consolas, 'Courier New', monospace",
};

const Placeholder = () => <div className={styles.placeholder} />;

const ensurePositiveInt = (value, defaultValue) => {
  return Math.max(1, (value !== undefined ? value : defaultValue) | 0);
};

const messageToMarker = message => {
  const startLineNumber = ensurePositiveInt(message.line, 1);
  const startColumn = ensurePositiveInt(message.column, 1);
  const endLineNumber = ensurePositiveInt(message.endLine, startLineNumber);
  const endColumn = ensurePositiveInt(message.endColumn, startColumn + 1);
  const code = message.ruleId || 'FATAL';
  return {
    code,
    severity: monaco.MarkerSeverity.Error,
    source: 'ESLint',
    message: message.message,
    startLineNumber,
    startColumn,
    endLineNumber,
    endColumn,
  };
};

function Editor(props) {
  const { isDarkTheme } = useThemeContext();
  const editorRef = useRef(null);
  const linterRef = useRef(null);

  useEffect(() => {
    const handler = () => {
      if (editorRef.current) editorRef.current.layout();
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const onEditorDidMount = useCallback(async editor => {
    editorRef.current = editor;
    linterRef.current = await loadLinter();
    if (props.editorDidMount) props.editorDidMount();

    if (props.value) {
      const messages = linterRef.current.lint(props.value, {}, {});
      const editor = editorRef.current;
      const markers = messages.map(message => messageToMarker(message));
      monaco.editor.setModelMarkers(editor.getModel(), editor.getId(), markers);
    }
  }, []);

  const onEditorChange = useCallback(text => {
    if (linterRef.current) {
      const messages = linterRef.current.lint(text, {}, {});
      const editor = editorRef.current;
      const markers = messages.map(message => messageToMarker(message));
      monaco.editor.setModelMarkers(editor.getModel(), editor.getId(), markers);
    }
  }, []);

  return (
    <Suspense fallback={<Placeholder />}>
      <MonacoEditor
        {...props}
        options={{ ...defaultOptions, ...props.options }}
        editorDidMount={onEditorDidMount}
        onChange={onEditorChange}
        language="typescript"
        theme={isDarkTheme ? 'vs-dark' : 'vs-light'}
      />
    </Suspense>
  );
}

export default Editor;
