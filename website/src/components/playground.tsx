import React, { useEffect, useRef, useState } from 'react';
import useThemeContext from '@theme/hooks/useThemeContext';
import styles from './playground.module.css';
import Loader from './loader';

import { messageToMarker, createURI } from './lib/utils';
import { sandboxSingleton } from './lib/load-sandbox';
import { loadLinter, WebLinter } from './linter/linter';
import useHashState from './lib/use-hash-state';

import type { PlaygroundConfig, Sandbox } from '../vendor/sandbox';
import type { editor as editorApi, IDisposable } from 'monaco-editor';
import type { ParseForESLintResult } from './linter/parser';
import { createProvideCodeActions } from './lib/action';
import OptionsSelector from './options-selector';
import ASTViewer from './ast-viewer';
import clsx from 'clsx';

// TODO: split editor to separate component
function Playground(): JSX.Element {
  const [state, setState] = useHashState({
    jsx: false,
    showAST: false,
    sourceType: 'module' as 'script' | 'module',
    code: '',
    rules: {} as Record<string, unknown>,
  });
  const { isDarkTheme } = useThemeContext();
  const sandboxRef = useRef<Sandbox | null>(null);
  const [ast, setAST] = useState<ParseForESLintResult['ast'] | string | null>();
  const [linter, setLinter] = useState<WebLinter | null>(null);
  const [fixes] = useState(() => new Map());
  const disposableRef = useRef<IDisposable | null>(null);
  const changeRef = useRef<IDisposable | null>(null);

  useEffect(() => {
    (async (): Promise<void> => {
      const sandboxConfig: Partial<PlaygroundConfig> = {
        text: state.code,
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
      instance.setText(state.code);
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
        setState('code', code);
      });
      instance.editor.layout();
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

  useEffect(() => {
    if (linter && sandboxRef.current) {
      const messages = linter.lint(
        state.code,
        {
          ecmaFeatures: {
            jsx: state.jsx ?? false,
            globalReturn: false,
          },
          ecmaVersion: 2020,
          project: ['./tsconfig.json'],
          sourceType: state.sourceType ?? 'module',
        },
        state.rules,
      );
      const markers: editorApi.IMarkerData[] = [];
      fixes.clear();
      let fatalMessage: string | undefined = undefined;
      for (const message of messages) {
        if (!message.ruleId) {
          fatalMessage = message.message;
        }
        const marker = messageToMarker(message);
        markers.push(marker);
        fixes.set(createURI(marker), message);
      }
      sandboxRef.current.monaco.editor.setModelMarkers(
        sandboxRef.current.editor.getModel()!,
        sandboxRef.current.editor.getId(),
        markers,
      );
      setAST(fatalMessage ?? linter.getAst());
    }
  }, [linter, state]);

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
    window.addEventListener('resize', handler);
    return (): void => {
      window.removeEventListener('resize', handler);
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (sandboxRef.current) {
        sandboxRef.current.editor.layout();
      }
    }, 100);
  }, [state]);

  return (
    <div className={styles.codeContainer}>
      <div className={styles.options}>
        <OptionsSelector
          state={state}
          setState={setState}
          ruleOptions={linter?.ruleNames ?? []}
        />
      </div>
      <div className={styles.codeBlocks}>
        <div
          className={clsx(
            styles.sourceCode,
            state.showAST ? '' : styles.sourceCodeStandalone,
          )}
        >
          {!sandboxRef.current && <Loader />}
          <div id="monaco-editor-embed" style={{ height: '100%' }} />
        </div>
        {state.showAST && (
          <div className={styles.astViewer}>
            {ast && <ASTViewer ast={ast} />}
          </div>
        )}
      </div>
    </div>
  );
}

export default Playground;
