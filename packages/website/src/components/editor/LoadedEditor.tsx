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

import { parse } from 'json5';
import { debounce } from '../lib/debounce';
import { createProvideCodeActions } from './createProvideCodeActions';
import {
  createCompilerOptions,
  getEslintSchema,
  getTsConfigSchema,
} from '@site/src/components/editor/config';
import {
  parseMarkers,
  parseLintResults,
  LintCodeAction,
} from '../linter/utils';
import { ConfigModel } from '../types';

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
    // TODO: find a better way we should not convert data from and to json so many times,
    // TODO: all configs should be stored as string and parsed only when needed
    const update: Partial<ConfigModel> = {};
    try {
      const eslintrc: unknown = parse(tabs.eslintrc.getValue());
      if (eslintrc && typeof eslintrc === 'object' && 'rules' in eslintrc) {
        // @ts-expect-error: we have to do something about this
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        update.rules = eslintrc.rules ?? {};
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
    try {
      const config: unknown = parse(tabs.tsconfig.getValue());
      if (config && typeof config === 'object' && 'compilerOptions' in config) {
        // @ts-expect-error: we have to do something about this
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        update.tsConfig = config.compilerOptions ?? {};
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
    onChange(update);

    sandboxInstance.editor.setModel(tabs[activeTab]);
    updateMarkers();
  }, [activeTab]);

  useEffect(() => {
    const config = createCompilerOptions(jsx, tsConfig);
    webLinter.updateCompilerOptions(config);
    sandboxInstance.setCompilerSettings(config);

    const text = JSON.stringify({ compilerOptions: tsConfig ?? {} }, null, 4);
    if (text === tabs.tsconfig.getValue()) {
      tabs.tsconfig.setValue(text);
    }
  }, [jsx, tsConfig]);

  useEffect(() => {
    const text = JSON.stringify({ rules: rules ?? {} }, null, 4);
    if (text !== tabs.eslintrc.getValue()) {
      tabs.eslintrc.setValue(text);
    }
  }, [rules]);

  useEffect(
    debounce(() => {
      // eslint-disable-next-line no-console
      console.info('[Editor] linting triggered');

      webLinter.updateParserOptions(jsx, sourceType);

      const messages = webLinter.lint(code, rules ?? {});

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
    [code, jsx, rules, sourceType, tsConfig, webLinter],
  );

  useEffect(() => {
    // configure the JSON language support with schemas and schema associations
    sandboxInstance.monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: [
        {
          uri: 'eslint-schema.json', // id of the first schema
          fileMatch: [tabs.eslintrc.uri.toString()], // associate with our model
          schema: getEslintSchema(webLinter.getRules()),
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
