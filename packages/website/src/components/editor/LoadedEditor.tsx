import React, { useMemo } from 'react';
import type Monaco from 'monaco-editor';
import { useEffect, useRef, useState } from 'react';
import type { SandboxInstance } from './useSandboxServices';
import type { CommonEditorProps } from './types';
import type { WebLinter } from '../linter/WebLinter';

import { debounce } from '../lib/debounce';
import { createProvideCodeActions } from './createProvideCodeActions';
import { createCompilerOptions } from '@site/src/components/editor/config';
import {
  parseMarkers,
  parseLintResults,
  LintCodeAction,
} from '../linter/utils';

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
  const codeActions = useRef(new Map<string, LintCodeAction[]>()).current;

  useEffect(() => {
    const config = createCompilerOptions(jsx, tsConfig);
    webLinter.updateCompilerOptions(config);
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

      webLinter.updateParserOptions(jsx, sourceType);

      const messages = webLinter.lint(code, rules ?? {});

      const markers = parseLintResults(messages, codeActions);

      sandboxInstance.monaco.editor.setModelMarkers(
        sandboxInstance.editor.getModel()!,
        sandboxInstance.editor.getId(),
        markers,
      );

      // fallback when event is not preset, ts < 4.0.5
      if (!sandboxInstance.monaco.editor.onDidChangeMarkers) {
        const markers = sandboxInstance.monaco.editor.getModelMarkers({});
        onMarkersChange(
          parseMarkers(markers, codeActions, sandboxInstance.editor),
        );
      }

      onEsASTChange(webLinter.storedAST);
      onTsASTChange(webLinter.storedTsAST);
      onScopeChange(webLinter.storedScope);
      onSelect(sandboxInstance.editor.getPosition());
    }, 500),
    [code, jsx, sandboxInstance, rules, sourceType, tsConfig, webLinter],
  );

  useEffect(() => {
    const subscriptions = [
      main.languages.registerCodeActionProvider(
        'typescript',
        createProvideCodeActions(codeActions),
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
      // may not be defined in ts < 4.0.5
      sandboxInstance.monaco.editor.onDidChangeMarkers?.(() => {
        const markers = sandboxInstance.monaco.editor.getModelMarkers({});
        onMarkersChange(
          parseMarkers(markers, codeActions, sandboxInstance.editor),
        );
      }),
    ];

    return (): void => {
      for (const subscription of subscriptions) {
        if (subscription) {
          subscription.dispose();
        }
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
