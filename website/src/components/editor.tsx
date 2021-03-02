import React, {
  Suspense,
  lazy,
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import useThemeContext from '@theme/hooks/useThemeContext';
// @ts-ignore
import styles from './styles.module.css';
import { createURI, registerCodeActionProvider } from './lib/action';
import { loadLinter, WebLinter } from './lib/linter';

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

const ensurePositiveInt = (value: number | undefined, defaultValue: number) => {
  return Math.max(1, (value !== undefined ? value : defaultValue) | 0);
};

const messageToMarker = (message): monaco.editor.IMarkerData => {
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
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const linterRef = useRef<WebLinter | null>(null);
  const [fixes] = useState(() => new Map());

  useEffect(() => {
    const handler = () => {
      if (editorRef.current) editorRef.current.layout();
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const updateMarkers = async (value: string) => {
    if (linterRef.current && editorRef.current) {
      const messages = linterRef.current.lint(value, {}, {});
      const markers: monaco.editor.IMarkerData[] = [];
      fixes.clear();
      for (const message of messages) {
        const marker = messageToMarker(message);
        markers.push(marker);
        fixes.set(createURI(marker), message);
      }
      monaco.editor.setModelMarkers(
        editorRef.current.getModel()!,
        editorRef.current.getId(),
        markers,
      );
    }
  };

  const onEditorDidMount = useCallback(
    async (editor: monaco.editor.IStandaloneCodeEditor) => {
      editorRef.current = editor;
      linterRef.current = await loadLinter();
      if (props.editorDidMount) props.editorDidMount();

      registerCodeActionProvider('typescript', fixes);

      if (props.value) {
        await updateMarkers(props.value);
      }
    },
    [],
  );

  const onEditorChange = useCallback(async value => {
    if (linterRef.current) {
      await updateMarkers(value);
    }
  }, []);

  return (
    <Suspense fallback={<Placeholder />}>
      <MonacoEditor
        {...props}
        options={{ ...defaultOptions, ...props.options }}
        editorDidMount={onEditorDidMount}
        onChange={onEditorChange}
        language={props.language}
        theme={isDarkTheme ? 'vs-dark' : 'vs-light'}
      />
    </Suspense>
  );
}

export default Editor;
