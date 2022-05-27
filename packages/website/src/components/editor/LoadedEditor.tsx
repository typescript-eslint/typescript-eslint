import React, {
  useCallback,
  useMemo,
  useEffect,
  useRef,
  useState,
} from 'react';
import type Monaco from 'monaco-editor';
import type { SandboxInstance } from './useSandboxServices';
import type { CommonEditorProps } from './types';
import type { TabType } from '../types';
import type { WebLinter } from '../linter/WebLinter';

import { debounce } from '../lib/debounce';
import { createProvideCodeActions } from './createProvideCodeActions';
import {
  createCompilerOptions,
  getEslintSchema,
  getTsConfigSchema,
} from './config';
import {
  parseMarkers,
  parseLintResults,
  LintCodeAction,
} from '../linter/utils';
import { parseESLintRC, parseTSConfig } from '../config/utils';

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
  sandboxInstance,
  showAST,
  sourceType,
  tsconfig,
  eslintrc,
  webLinter,
  activeTab,
}) => {
  const [decorations, setDecorations] = useState<string[]>([]);
  const codeActions = useRef(new Map<string, LintCodeAction[]>()).current;
  const [tabs] = useState<Record<TabType, Monaco.editor.ITextModel>>(() => {
    return {
      code: sandboxInstance.editor.getModel()!,
      tsconfig: sandboxInstance.monaco.editor.createModel('{}', 'json'),
      eslintrc: sandboxInstance.monaco.editor.createModel('{}', 'json'),
    };
  });

  const updateMarkers = useCallback(() => {
    const model = sandboxInstance.editor.getModel()!;
    const markers = sandboxInstance.monaco.editor.getModelMarkers({
      resource: model.uri,
    });
    onMarkersChange(parseMarkers(markers, codeActions, model));
  }, []);

  useEffect(() => {
    const config = createCompilerOptions(jsx, parseTSConfig(tsconfig));
    webLinter.updateCompilerOptions(config);
    sandboxInstance.setCompilerSettings(config);
  }, [jsx, tsconfig]);

  useEffect(() => {
    if (tsconfig !== tabs.tsconfig.getValue()) {
      tabs.tsconfig.setValue(tsconfig ?? '{}');
    }
  }, [tsconfig]);

  useEffect(() => {
    webLinter.updateRules(parseESLintRC(eslintrc));

    if (eslintrc !== tabs.eslintrc.getValue()) {
      tabs.eslintrc.setValue(eslintrc ?? '{}');
    }
  }, [eslintrc]);

  useEffect(() => {
    onChange({
      eslintrc: tabs.eslintrc.getValue(),
      tsconfig: tabs.tsconfig.getValue(),
    });

    sandboxInstance.editor.setModel(tabs[activeTab]);
    updateMarkers();
  }, [activeTab]);

  useEffect(
    debounce(() => {
      // eslint-disable-next-line no-console
      console.info('[Editor] linting triggered');

      webLinter.updateParserOptions(jsx, sourceType);

      const messages = webLinter.lint(code);

      const markers = parseLintResults(messages, codeActions);

      sandboxInstance.monaco.editor.setModelMarkers(
        tabs.code,
        'eslint',
        markers,
      );

      // fallback when event is not preset, ts < 4.0.5
      if (!sandboxInstance.monaco.editor.onDidChangeMarkers) {
        updateMarkers();
      }

      onEsASTChange(webLinter.storedAST);
      onTsASTChange(webLinter.storedTsAST);
      onScopeChange(webLinter.storedScope);
      onSelect(sandboxInstance.editor.getPosition());
    }, 500),
    [code, jsx, tsconfig, eslintrc, sourceType, webLinter],
  );

  useEffect(() => {
    // configure the JSON language support with schemas and schema associations
    sandboxInstance.monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: [
        {
          uri: 'eslint-schema.json', // id of the first schema
          fileMatch: [tabs.eslintrc.uri.toString()], // associate with our model
          schema: getEslintSchema(webLinter.ruleNames),
        },
        {
          uri: 'ts-schema.json', // id of the first schema
          fileMatch: [tabs.tsconfig.uri.toString()], // associate with our model
          schema: getTsConfigSchema(),
        },
      ],
    });

    const subscriptions = [
      main.languages.registerCodeActionProvider(
        'typescript',
        createProvideCodeActions(codeActions),
      ),
      sandboxInstance.editor.onDidChangeCursorPosition(
        debounce(() => {
          if (sandboxInstance.editor.getModel() === tabs.code) {
            const position = sandboxInstance.editor.getPosition();
            if (position) {
              // eslint-disable-next-line no-console
              console.info('[Editor] updating cursor', position);
              onSelect(position);
            }
          }
        }, 150),
      ),
      tabs.code.onDidChangeContent(
        debounce(() => {
          onChange({ code: tabs.code.getValue() });
        }, 500),
      ),
      // may not be defined in ts < 4.0.5
      sandboxInstance.monaco.editor.onDidChangeMarkers?.(() => {
        updateMarkers();
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
    const modelValue = tabs.code.getValue();
    if (modelValue === code) {
      return;
    }
    // eslint-disable-next-line no-console
    console.info('[Editor] updating editor model');
    tabs.code.applyEdits([
      {
        range: tabs.code.getFullModelRange(),
        text: code,
      },
    ]);
  }, [code]);

  useEffect(() => {
    sandboxInstance.monaco.editor.setTheme(darkTheme ? 'vs-dark' : 'vs-light');
  }, [darkTheme, sandboxInstance]);

  useEffect(() => {
    if (sandboxInstance.editor.getModel() === tabs.code) {
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
    }
  }, [decoration, sandboxInstance, showAST]);

  return null;
};
