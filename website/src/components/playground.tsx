import React, { useCallback, useEffect, useRef, useState } from 'react';
import useThemeContext from '@theme/hooks/useThemeContext';
import styles from './playground.module.css';
import Loader from './loader';

import {
  getQueryParams,
  messageToMarker,
  createURI,
  QueryParamOptions,
  updateQueryParams,
} from './lib/utils';
import { sandboxSingleton } from './lib/load-sandbox';
import { loadLinter, WebLinter } from './linter/linter';

import type { PlaygroundConfig, Sandbox } from '../vendor/sandbox';
import type { Linter } from 'eslint';
import type { ParserOptions } from '@typescript-eslint/parser';
import type { editor as editorApi, IDisposable } from 'monaco-editor';
import type { ParseForESLintResult } from './linter/parser';
import { createProvideCodeActions } from './lib/action';
import OptionsSelector from './options-selector';
import ASTViewer from './ast-viewer';
import clsx from 'clsx';

function Playground(): JSX.Element {
  const params = getQueryParams();
  const { isDarkTheme } = useThemeContext();
  const sandboxRef = useRef<Sandbox | null>(null);
  const [code, setCode] = useState<string>(params.code ?? '');
  const [showAST, setShowAST] = useState<boolean>(params.showAST ?? false);
  const [ast, setAST] = useState<ParseForESLintResult['ast'] | null>();
  const [linter, setLinter] = useState<WebLinter | null>(null);
  const [fixes] = useState(() => new Map());
  const disposableRef = useRef<IDisposable | null>(null);
  const changeRef = useRef<IDisposable | null>(null);
  const [rules, setRules] = useState<Linter.RulesRecord>(
    () => params.rules ?? {},
  );
  const [parserOptions, setParserOptions] = useState<ParserOptions>(() => {
    return {
      ecmaFeatures: {
        jsx: params.jsx ?? false,
        globalReturn: false,
      },
      ecmaVersion: 2020,
      project: ['./tsconfig.json'],
      sourceType: params.sourceType ?? 'module',
    };
  });

  useEffect(() => {
    (async (): Promise<void> => {
      const sandboxConfig: Partial<PlaygroundConfig> = {
        text: code,
        monacoSettings: {
          minimap: { enabled: false },
          fontSize: 13,
          wordWrap: 'off',
          scrollBeyondLastLine: false,
          smoothScrolling: true,
        },
        compilerOptions: {},
        domID: 'monaco-editor-embed',
      };
      const { main, sandboxFactory, ts } = await sandboxSingleton;
      const instance = sandboxFactory.createTypeScriptSandbox(
        sandboxConfig,
        main,
        ts,
      );
      main.editor.setTheme(isDarkTheme ? 'sandbox-dark' : 'sandbox');
      instance.setText(code);
      instance.editor.focus();
      const linterInstance = await loadLinter();
      sandboxRef.current = instance;
      setLinter(linterInstance);
      disposableRef.current = main.languages.registerCodeActionProvider(
        'typescript',
        createProvideCodeActions(fixes),
      );
      changeRef.current = instance.editor.onDidChangeModelContent(_event => {
        const code = instance.editor.getValue();
        updateQueryParams({ code });
        setCode(code);
      });
    })();

    return (): void => {
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

  const onOptionsUpdate = useCallback(
    (data: Partial<QueryParamOptions>) => {
      updateQueryParams(data);
      if ('sourceType' in data) {
        setParserOptions({ ...parserOptions, sourceType: data.sourceType });
      } else if ('jsx' in data) {
        setParserOptions({
          ...parserOptions,
          ecmaFeatures: {
            ...(parserOptions.ecmaFeatures ?? {}),
            jsx: data.jsx,
          },
        });
      } else if ('showAST' in data) {
        setShowAST(data.showAST ?? false);
      } else if ('rules' in data) {
        setRules(data.rules);
      }
    },
    [parserOptions],
  );

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
      setAST(linter.getAst());
    }
  }, [linter, rules, code, parserOptions]);

  useEffect(() => {
    const params = getQueryParams();
    if (params.code !== code) {
      updateQueryParams({ code });
      if (sandboxRef.current) {
        sandboxRef.current.setText(code);
      }
    }
  }, [code]);

  useEffect(() => {
    if (sandboxRef.current) {
      sandboxRef.current.monaco.editor.setTheme(
        isDarkTheme ? 'vs-dark' : 'vs-light',
      );
    }
  }, [isDarkTheme]);

  useEffect(() => {
    const handler = (): void => {
      if (sandboxRef.current) {
        sandboxRef.current.editor.layout();
      }
    };
    // const handleHashChange = () => {
    //   const params = getQueryParams();
    //   if (
    //     params.code !== code ||
    //     params.rules !== rules ||
    //     params.parserOptions !== parserOptions
    //   ) {
    //     setCode(params.code || '');
    //     setRules(params.rules || {});
    //     setParserOptions(params.parserOptions || {});
    //   }
    // };
    window.addEventListener('resize', handler);
    // window.addEventListener('hashchange', handleHashChange, false);
    return (): void => {
      // window.removeEventListener('hashchange', handleHashChange, false);
      window.removeEventListener('resize', handler);
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (sandboxRef.current) {
        sandboxRef.current.editor.layout();
      }
    }, 100);
  }, [showAST]);

  return (
    <div className={styles.codeContainer}>
      <div className={styles.options}>
        <OptionsSelector
          ruleOptions={linter?.ruleNames ?? []}
          rules={rules}
          jsx={params.jsx}
          showAST={params.showAST}
          sourceType={params.sourceType}
          onUpdate={onOptionsUpdate}
        />
      </div>
      <div className={styles.codeBlocks}>
        <div
          className={clsx(
            styles.sourceCode,
            showAST ? '' : styles.sourceCodeStandalone,
          )}
        >
          {!sandboxRef.current && <Loader />}
          <div id="monaco-editor-embed" style={{ height: '100%' }} />
        </div>
        {showAST && (
          <div className={styles.astViewer}>
            {ast && <ASTViewer ast={ast} />}
          </div>
        )}
      </div>
    </div>
  );
}

export default Playground;
