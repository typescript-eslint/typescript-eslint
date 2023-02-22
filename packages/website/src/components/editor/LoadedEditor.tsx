import { useColorMode } from '@docusaurus/theme-common';
import type Monaco from 'monaco-editor';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  parseESLintRC,
  parseTSConfig,
  tryParseEslintModule,
} from '../config/utils';
import { useResizeObserver } from '../hooks/useResizeObserver';
import { debounce } from '../lib/debounce';
import type { LintCodeAction } from '../linter/utils';
import { parseLintResults, parseMarkers } from '../linter/utils';
import type { WebLinter } from '../linter/WebLinter';
import type { TabType } from '../types';
import {
  createCompilerOptions,
  getEslintSchema,
  getTsConfigSchema,
} from './config';
import { createProvideCodeActions } from './createProvideCodeActions';
import type { CommonEditorProps } from './types';
import type { SandboxInstance } from './useSandboxServices';

export interface LoadedEditorProps extends CommonEditorProps {
  readonly main: typeof Monaco;
  readonly sandboxInstance: SandboxInstance;
  readonly webLinter: WebLinter;
}

export const LoadedEditor: React.FC<LoadedEditorProps> = ({
  code,
  tsconfig,
  eslintrc,
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
  webLinter,
  activeTab,
}) => {
  const { colorMode } = useColorMode();
  const [_, setDecorations] = useState<string[]>([]);

  const codeActions = useRef(new Map<string, LintCodeAction[]>()).current;
  const [tabs] = useState<Record<TabType, Monaco.editor.ITextModel>>(() => {
    const tabsDefault = {
      code: sandboxInstance.editor.getModel()!,
      tsconfig: sandboxInstance.monaco.editor.createModel(
        tsconfig,
        'json',
        sandboxInstance.monaco.Uri.file('/tsconfig.json'),
      ),
      eslintrc: sandboxInstance.monaco.editor.createModel(
        eslintrc,
        'json',
        sandboxInstance.monaco.Uri.file('/.eslintrc'),
      ),
    };
    tabsDefault.code.updateOptions({ tabSize: 2, insertSpaces: true });
    tabsDefault.eslintrc.updateOptions({ tabSize: 2, insertSpaces: true });
    tabsDefault.tsconfig.updateOptions({ tabSize: 2, insertSpaces: true });
    return tabsDefault;
  });

  const updateMarkers = useCallback(() => {
    const model = sandboxInstance.editor.getModel()!;
    const markers = sandboxInstance.monaco.editor.getModelMarkers({
      resource: model.uri,
    });
    onMarkersChange(parseMarkers(markers, codeActions, sandboxInstance.editor));
  }, [
    codeActions,
    onMarkersChange,
    sandboxInstance.editor,
    sandboxInstance.monaco.editor,
  ]);

  useEffect(() => {
    const newPath = jsx ? '/input.tsx' : '/input.ts';
    if (tabs.code.uri.path !== newPath) {
      const newModel = sandboxInstance.monaco.editor.createModel(
        tabs.code.getValue(),
        'typescript',
        sandboxInstance.monaco.Uri.file(newPath),
      );
      newModel.updateOptions({ tabSize: 2, insertSpaces: true });
      if (tabs.code.isAttachedToEditor()) {
        sandboxInstance.editor.setModel(newModel);
      }
      tabs.code.dispose();
      tabs.code = newModel;
    }
  }, [
    jsx,
    sandboxInstance.editor,
    sandboxInstance.monaco.Uri,
    sandboxInstance.monaco.editor,
    tabs,
  ]);

  useEffect(() => {
    const config = createCompilerOptions(
      jsx,
      parseTSConfig(tsconfig).compilerOptions,
    );
    webLinter.updateCompilerOptions(config);
    sandboxInstance.setCompilerSettings(config);
  }, [jsx, sandboxInstance, tsconfig, webLinter]);

  useEffect(() => {
    webLinter.updateRules(parseESLintRC(eslintrc).rules);
  }, [eslintrc, webLinter]);

  useEffect(() => {
    sandboxInstance.editor.setModel(tabs[activeTab]);
    updateMarkers();
  }, [activeTab, sandboxInstance.editor, tabs, updateMarkers]);

  useEffect(() => {
    const lintEditor = debounce(() => {
      // eslint-disable-next-line no-console
      console.info('[Editor] linting triggered');

      webLinter.updateParserOptions(jsx, sourceType);

      try {
        const messages = webLinter.lint(code);

        const markers = parseLintResults(messages, codeActions, ruleId =>
          sandboxInstance.monaco.Uri.parse(
            webLinter.rulesUrl.get(ruleId) ?? '',
          ),
        );

        sandboxInstance.monaco.editor.setModelMarkers(
          tabs.code,
          'eslint',
          markers,
        );

        // fallback when event is not preset, ts < 4.0.5
        if (!sandboxInstance.monaco.editor.onDidChangeMarkers) {
          updateMarkers();
        }
      } catch (e) {
        onMarkersChange(e as Error);
      }

      onEsASTChange(webLinter.storedAST);
      onTsASTChange(webLinter.storedTsAST);
      onScopeChange(webLinter.storedScope);
      onSelect(sandboxInstance.editor.getPosition());
    }, 500);

    lintEditor();
  }, [
    code,
    jsx,
    tsconfig,
    eslintrc,
    sourceType,
    webLinter,
    onEsASTChange,
    onTsASTChange,
    onScopeChange,
    onSelect,
    sandboxInstance.editor,
    sandboxInstance.monaco.editor,
    sandboxInstance.monaco.Uri,
    codeActions,
    tabs.code,
    updateMarkers,
    onMarkersChange,
  ]);

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
      sandboxInstance.editor.onDidPaste(() => {
        if (tabs.eslintrc.isAttachedToEditor()) {
          const value = tabs.eslintrc.getValue();
          const newValue = tryParseEslintModule(value);
          if (newValue !== value) {
            tabs.eslintrc.setValue(newValue);
          }
        }
      }),
      sandboxInstance.editor.onDidChangeCursorPosition(
        debounce(() => {
          if (tabs.code.isAttachedToEditor()) {
            const position = sandboxInstance.editor.getPosition();
            if (position) {
              // eslint-disable-next-line no-console
              console.info('[Editor] updating cursor', position);
              onSelect(position);
            }
          }
        }, 150),
      ),
      tabs.eslintrc.onDidChangeContent(
        debounce(() => {
          onChange({ eslintrc: tabs.eslintrc.getValue() });
        }, 500),
      ),
      tabs.tsconfig.onDidChangeContent(
        debounce(() => {
          onChange({ tsconfig: tabs.tsconfig.getValue() });
        }, 500),
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
  }, [
    codeActions,
    main.languages,
    onChange,
    onSelect,
    sandboxInstance.editor,
    sandboxInstance.monaco.editor,
    sandboxInstance.monaco.languages.json.jsonDefaults,
    tabs.code,
    tabs.eslintrc,
    tabs.tsconfig,
    updateMarkers,
    webLinter.ruleNames,
  ]);

  const resize = useMemo(() => {
    return debounce(() => sandboxInstance.editor.layout(), 1);
  }, [sandboxInstance]);

  const container =
    sandboxInstance.editor.getContainerDomNode?.() ??
    sandboxInstance.editor.getDomNode();

  useResizeObserver(container, () => {
    resize();
  });

  useEffect(() => {
    if (
      !sandboxInstance.editor.hasTextFocus() &&
      code !== tabs.code.getValue()
    ) {
      tabs.code.applyEdits([
        {
          range: tabs.code.getFullModelRange(),
          text: code,
        },
      ]);
    }
  }, [sandboxInstance, code, tabs.code]);

  useEffect(() => {
    if (
      !sandboxInstance.editor.hasTextFocus() &&
      tsconfig !== tabs.tsconfig.getValue()
    ) {
      tabs.tsconfig.applyEdits([
        {
          range: tabs.tsconfig.getFullModelRange(),
          text: tsconfig,
        },
      ]);
    }
  }, [sandboxInstance, tabs.tsconfig, tsconfig]);

  useEffect(() => {
    if (
      !sandboxInstance.editor.hasTextFocus() &&
      eslintrc !== tabs.eslintrc.getValue()
    ) {
      tabs.eslintrc.applyEdits([
        {
          range: tabs.eslintrc.getFullModelRange(),
          text: eslintrc,
        },
      ]);
    }
  }, [sandboxInstance, eslintrc, tabs.eslintrc]);

  useEffect(() => {
    sandboxInstance.monaco.editor.setTheme(
      colorMode === 'dark' ? 'vs-dark' : 'vs-light',
    );
  }, [colorMode, sandboxInstance]);

  useEffect(() => {
    setDecorations(prevDecorations =>
      tabs.code.deltaDecorations(
        prevDecorations,
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
  }, [decoration, sandboxInstance, showAST, tabs.code]);

  return null;
};
