import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  editor as editorApi,
  IDisposable,
} from 'monaco-editor/esm/vs/editor/editor.api';
import useThemeContext from '@theme/hooks/useThemeContext';
// @ts-ignore
import styles from './editor.module.css';
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
import MonacoEditor from 'react-monaco-editor';

interface EditorProps {
  language: string;
  editorDidMount?(): void;
  options?: editorApi.IStandaloneEditorConstructionOptions;
}

function Editor(props: EditorProps) {
  const params = getQueryParams();
  const [code, setCode] = useState<string>(params.code || defaultCode);
  const [rules, setRules] = useState<Linter.RulesRecord>(
    params.rules || defaultRules,
  );
  const [parserOptions, setParserOptions] = useState<ParserOptions>(
    params.parserOptions || defaultParserOptions,
  );

  const { isDarkTheme } = useThemeContext();
  const editorRef = useRef<editorApi.IStandaloneCodeEditor | null>(null);
  const disposableRef = useRef<IDisposable | null>(null);
  const [linter, setLinter] = useState<WebLinter | null>(null);
  const [fixes] = useState(() => new Map());

  useEffect(() => {
    const handler = () => {
      if (editorRef.current) editorRef.current.layout();
    };
    const handleHashChange = () => {
      const params = getQueryParams();
      if (
        params.code !== code ||
        params.rules !== rules ||
        params.parserOptions !== parserOptions
      ) {
        setCode(params.code || '');
        setRules(params.rules || {});
        setParserOptions(params.parserOptions || {});
      }
    };
    window.addEventListener('resize', handler);
    window.addEventListener('hashchange', handleHashChange, false);
    return () => {
      disposableRef.current?.dispose();
      window.removeEventListener('hashchange', handleHashChange, false);
      window.removeEventListener('resize', handler);
    };
  }, []);

  useEffect(() => {
    (async () => setLinter(await loadLinter()))();
  }, []);

  useEffect(() => {
    if (linter && editorRef.current) {
      const messages = linter.lint(code, parserOptions, rules);
      const markers: editorApi.IMarkerData[] = [];
      fixes.clear();
      for (const message of messages) {
        const marker = messageToMarker(message);
        markers.push(marker);
        fixes.set(createURI(marker), message);
      }
      editorApi.setModelMarkers(
        editorRef.current.getModel()!,
        editorRef.current.getId(),
        markers,
      );
    }
  }, [rules, code, linter, parserOptions]);

  useEffect(() => {
    const params = getQueryParams();
    if (
      params.code !== code ||
      params.rules !== rules ||
      params.parserOptions !== parserOptions
    ) {
      setQueryParams({ code, rules, parserOptions });
    }
  }, [code, rules, parserOptions]);

  const onEditorDidMount = useCallback(
    (editor: editorApi.IStandaloneCodeEditor) => {
      editorRef.current = editor;
      if (props.editorDidMount) props.editorDidMount();

      disposableRef.current = registerCodeActionProvider(props.language, fixes);
    },
    [],
  );

  return (
    <MonacoEditor
      {...props}
      value={code}
      options={{ ...defaultOptions, ...props.options }}
      editorDidMount={onEditorDidMount}
      onChange={setCode}
      language={props.language}
      theme={isDarkTheme ? 'vs-dark' : 'vs-light'}
    />
  );
}

export default Editor;
