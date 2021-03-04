import React, { useEffect, useRef, useState } from 'react';
import useThemeContext from '@theme/hooks/useThemeContext';
import styles from './playground.module.css';
import Expander from './expander';
import Loader from './loader';

import {
  defaultCode,
  defaultParserOptions,
  defaultRules,
  monacoSettings,
} from './lib/config';
import {
  getQueryParams,
  messageToMarker,
  createURI,
  setQueryParams,
} from './lib/utils';
import { sandboxSingleton } from './lib/load-sandbox';
import { loadLinter, WebLinter } from './linter/linter';

import type { PlaygroundConfig, Sandbox } from '../vendor/sandbox';
import type { Linter } from 'eslint';
import type { ParserOptions } from '@typescript-eslint/parser';
import type { editor as editorApi, IDisposable } from 'monaco-editor';
import { createProvideCodeActions } from './lib/action';

export default function Playground() {
  const params = getQueryParams();
  const { isDarkTheme } = useThemeContext();
  const sandboxRef = useRef<Sandbox | null>(null);
  const [code, setCode] = useState<string>(params.code || defaultCode);
  const [linter, setLinter] = useState<WebLinter | null>(null);
  const [fixes] = useState(() => new Map());
  const disposableRef = useRef<IDisposable | null>(null);
  const changeRef = useRef<IDisposable | null>(null);
  const [rules, setRules] = useState<Linter.RulesRecord>(
    params.rules || defaultRules,
  );
  const [parserOptions, setParserOptions] = useState<ParserOptions>(
    params.parserOptions || defaultParserOptions,
  );

  useEffect(() => {
    (async () => {
      const sandboxConfig: Partial<PlaygroundConfig> = {
        text: code,
        monacoSettings: monacoSettings,
        compilerOptions: {},
        domID: 'monaco-editor-embed',
      };
      const { main, sandboxFactory, ts } = await sandboxSingleton;
      const instance = sandboxFactory.createTypeScriptSandbox(
        sandboxConfig,
        main,
        ts,
      );
      instance.monaco.editor.setTheme(isDarkTheme ? 'sandbox-dark' : 'sandbox');
      instance.setText(code);
      instance.editor.focus();
      const linterInstance = await loadLinter();
      sandboxRef.current = instance;
      setLinter(linterInstance);
      disposableRef.current = instance.monaco.languages.registerCodeActionProvider(
        'typescript',
        createProvideCodeActions(fixes),
      );
      changeRef.current = instance.editor.onDidChangeModelContent(_event => {
        setCode(instance.editor.getValue());
      });
    })();

    return () => {
      fixes.clear();
      disposableRef.current?.dispose();
      changeRef.current?.dispose();

      if (sandboxRef.current) {
        sandboxRef.current.monaco.editor.setModelMarkers(
          sandboxRef.current.editor.getModel()!,
          sandboxRef.current.editor.getId(),
          [],
        );
        sandboxRef.current.editor.dispose();
        const model = sandboxRef.current.editor.getModel();
        if (model) {
          model.dispose();
        }
        const models = sandboxRef.current.monaco.editor.getModels();
        for (const model of models) {
          model.dispose();
        }
      }
    };
  }, []);

  useEffect(() => {
    if (linter && sandboxRef.current) {
      const messages = linter.lint(code, parserOptions, rules);
      const markers: editorApi.IMarkerData[] = [];
      fixes.clear();
      for (const message of messages) {
        const marker = messageToMarker(message);
        markers.push(marker);
        fixes.set(createURI(marker), message);
      }
      sandboxRef.current.monaco.editor.setModelMarkers(
        sandboxRef.current.editor.getModel()!,
        sandboxRef.current.editor.getId(),
        markers,
      );
    }
  }, [linter, rules, code, parserOptions]);

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

  useEffect(() => {
    if (sandboxRef.current)
      sandboxRef.current.monaco.editor.setTheme(
        isDarkTheme ? 'vs-dark' : 'vs-light',
      );
  }, [isDarkTheme]);

  useEffect(() => {
    const handler = () => {
      if (sandboxRef.current) {
        sandboxRef.current.editor.layout();
      }
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
      window.removeEventListener('hashchange', handleHashChange, false);
      window.removeEventListener('resize', handler);
    };
  }, []);

  return (
    <div className={styles.codeContainer}>
      <div className={styles.options}>
        <Expander label="Parser Options" />
        <Expander label="ESLint Options" />
      </div>
      <div className={styles.sourceCode}>
        {!sandboxRef.current && <Loader />}
        <div id="monaco-editor-embed" style={{ height: '100%' }} />
      </div>
    </div>
  );
}
