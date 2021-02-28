import React, { Suspense, lazy, useRef, useEffect, useCallback } from 'react';
import useThemeContext from '@theme/hooks/useThemeContext';
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

const registerTheme = monaco => {
  const theme = {
    base: 'vs-dark',
    inherit: true,
    rules: [{ background: '18191a' }],
    colors: { 'editor.background': '#18191a' },
  };
  monaco.editor.defineTheme('hermes-vs-dark', theme);
};

const Placeholder = () => <div className={styles.placeholder} />;

function Editor(props) {
  const { isDarkTheme } = useThemeContext();
  const editorRef = useRef(null);

  useEffect(() => {
    const handler = () => {
      if (editorRef.current) editorRef.current.layout();
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const onEditorDidMount = useCallback(e => {
    editorRef.current = e;
    if (props.editorDidMount) props.editorDidMount();
  });

  return (
    <Suspense fallback={<Placeholder />}>
      <MonacoEditor
        {...props}
        options={Object.assign({}, defaultOptions, props.options)}
        editorWillMount={registerTheme}
        editorDidMount={onEditorDidMount}
        language="typescript"
        theme={isDarkTheme ? 'vs-dark' : 'vs-light'}
      />
    </Suspense>
  );
}

export default Editor;
