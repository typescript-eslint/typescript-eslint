import React, { useMemo } from 'react';
import type Monaco from 'monaco-editor';
import { useEffect, useRef, useState } from 'react';
import type { WebLinter } from '@typescript-eslint/website-eslint';
import type { SandboxInstance } from './useSandboxServices';
import type { CommonEditorProps } from './types';

import { debounce } from '../lib/debounce';
import { lintCode, LintCodeAction } from './lintCode';
import { createProvideCodeActions } from './createProvideCodeActions';
import { createURI, parseMarkers } from '@site/src/components/editor/utils';

export interface LoadedEditorProps extends CommonEditorProps {
  readonly main: typeof Monaco;
  readonly sandboxInstance: SandboxInstance;
  readonly webLinter: WebLinter;
}

export const LoadedEditor: React.FC<LoadedEditorProps> = ({
  code,
  darkTheme,
  decoration,
  jsx,
  main,
  onEsASTChange,
  onScopeChange,
  onTsASTChange,
  onMarkersChange,
  onChange,
  onSelect,
  rules,
  sandboxInstance,
  showAST,
  sourceType,
  tsConfig,
  webLinter,
}) => {
  const [decorations, setDecorations] = useState<string[]>([]);
  const fixes = useRef(new Map<string, LintCodeAction[]>()).current;

  useEffect(() => {
    const config = {
      noResolve: true,
      target: main.languages.typescript.ScriptTarget.ESNext,
      module: main.languages.typescript.ModuleKind.ESNext,
      ...tsConfig,
      jsx: jsx ? main.languages.typescript.JsxEmit.React : undefined,
    };

    webLinter.updateOptions(config);
    sandboxInstance.setCompilerSettings(config);
  }, [
    jsx,
    sandboxInstance,
    webLinter,
    JSON.stringify(tsConfig) /* todo: better way? */,
  ]);

  useEffect(
    debounce(() => {
      // eslint-disable-next-line no-console
      console.info('[Editor] linting triggered');

      const [markers, fatalMessage, codeActions] = lintCode(
        webLinter,
        code,
        rules,
        jsx,
        sourceType,
      );
      fixes.clear();
      for (const codeAction of codeActions) {
        fixes.set(codeAction[0], codeAction[1]);
      }

      sandboxInstance.monaco.editor.setModelMarkers(
        sandboxInstance.editor.getModel()!,
        sandboxInstance.editor.getId(),
        markers,
      );

      if (fatalMessage) {
        setDecorations(
          sandboxInstance.editor.deltaDecorations(decorations, []),
        );
      }

      onEsASTChange(fatalMessage ?? webLinter.getAst());
      onTsASTChange(fatalMessage ?? webLinter.getTsAst());
      onScopeChange(fatalMessage ?? webLinter.getScope());
      onSelect(sandboxInstance.editor.getPosition());
    }, 500),
    [code, jsx, sandboxInstance, rules, sourceType, tsConfig, webLinter],
  );

  useEffect(() => {
    const subscriptions = [
      main.languages.registerCodeActionProvider(
        'typescript',
        createProvideCodeActions(fixes),
      ),
      sandboxInstance.editor.onDidChangeCursorPosition(
        debounce(() => {
          const position = sandboxInstance.editor.getPosition();
          if (position) {
            // eslint-disable-next-line no-console
            console.info('[Editor] updating cursor', position);
            onSelect(position);
          }
        }, 150),
      ),
      sandboxInstance.editor.onDidChangeModelContent(
        debounce(() => {
          onChange(sandboxInstance.getModel().getValue());
        }, 500),
      ),
      sandboxInstance.monaco.editor.onDidChangeMarkers(() => {
        const markers = sandboxInstance.monaco.editor.getModelMarkers({});
        onMarkersChange(parseMarkers(markers, fixes));
      }),
    ];

    return (): void => {
      for (const subscription of subscriptions) {
        subscription.dispose();
      }
    };
  }, []);

  const resize = useMemo(() => {
    return debounce(() => sandboxInstance.editor.layout(), 1);
  }, [sandboxInstance]);

  useEffect(() => {
    resize();
  }, [resize, showAST]);

  useEffect(() => {
    window.addEventListener('resize', resize);
    return (): void => {
      window.removeEventListener('resize', resize);
    };
  });

  useEffect(() => {
    const model = sandboxInstance.editor.getModel()!;
    const modelValue = model.getValue();
    if (modelValue === code) {
      return;
    }
    // eslint-disable-next-line no-console
    console.info('[Editor] updating editor model');
    sandboxInstance.editor.executeEdits(modelValue, [
      {
        range: model.getFullModelRange(),
        text: code,
      },
    ]);
  }, [code, sandboxInstance]);

  useEffect(() => {
    sandboxInstance.monaco.editor.setTheme(darkTheme ? 'vs-dark' : 'vs-light');
  }, [darkTheme, sandboxInstance]);

  useEffect(() => {
    setDecorations(
      sandboxInstance.editor.deltaDecorations(
        decorations,
        decoration && showAST
          ? [
              {
                range: new sandboxInstance.monaco.Range(
                  decoration.start.line,
                  decoration.start.column + 1,
                  decoration.end.line,
                  decoration.end.column + 1,
                ),
                options: {
                  inlineClassName: 'myLineDecoration',
                  stickiness: 1,
                },
              },
            ]
          : [],
      ),
    );
  }, [decoration, sandboxInstance, showAST]);

  return null;
};
