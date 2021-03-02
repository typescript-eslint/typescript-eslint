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
import type { Linter } from 'eslint';
import type { ParserOptions } from '@typescript-eslint/parser';
import {
  defaultParserOptions,
  defaultRules,
  defaultCode,
  defaultOptions,
} from './lib/config';
import { getQueryParams, setQueryParams, messageToMarker } from './lib/utils';

const MonacoEditor = lazy(() => import('react-monaco-editor'));

const Placeholder = () => <div className={styles.placeholder} />;

function Editor(props) {
  const paramsState = getQueryParams();
  const [code, setCode] = useState<string>(paramsState?.code || defaultCode);
  const [rules, setRules] = useState<Linter.RulesRecord>(
    paramsState?.rules || defaultRules,
  );
  const [parserOptions, setParserOptions] = useState<ParserOptions>(
    paramsState?.parserOptions || defaultParserOptions,
  );

  const { isDarkTheme } = useThemeContext();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [linter, setLinter] = useState<WebLinter | null>(null);
  const [fixes] = useState(() => new Map());

  useEffect(() => {
    const handler = () => {
      if (editorRef.current) editorRef.current.layout();
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => {
    (async () => setLinter(await loadLinter()))();
  }, []);

  useEffect(() => {
    if (linter && editorRef.current) {
      const messages = linter.lint(code, parserOptions, rules);
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
  }, [rules, code, linter, parserOptions]);

  useEffect(() => {
    setQueryParams({ code, rules, parserOptions });
  }, [code, rules, parserOptions]);

  const onEditorDidMount = useCallback(
    (editor: monaco.editor.IStandaloneCodeEditor) => {
      editorRef.current = editor;
      if (props.editorDidMount) props.editorDidMount();

      registerCodeActionProvider(props.language, fixes);
    },
    [],
  );

  return (
    <Suspense fallback={<Placeholder />}>
      <MonacoEditor
        {...props}
        value={code}
        options={{ ...defaultOptions, ...props.options }}
        editorDidMount={onEditorDidMount}
        onChange={setCode}
        language={props.language}
        theme={isDarkTheme ? 'vs-dark' : 'vs-light'}
      />
    </Suspense>
  );
}

export default Editor;
