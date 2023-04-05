import { useColorMode } from '@docusaurus/theme-common';
import type Monaco from 'monaco-editor';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useResizeObserver } from '../hooks/useResizeObserver';
import { createCompilerOptions } from '../lib/createCompilerOptions';
import { debounce } from '../lib/debounce';
import {
  getEslintJsonSchema,
  getTypescriptJsonSchema,
} from '../lib/jsonSchema';
import {
  parseESLintRC,
  parseTSConfig,
  tryParseEslintModule,
} from '../lib/parseConfig';
import type { LintCodeAction } from '../linter/utils';
import { parseLintResults, parseMarkers } from '../linter/utils';
import type { WebLinter } from '../linter/WebLinter';
import type { TabType } from '../types';
import { createProvideCodeActions } from './createProvideCodeActions';
import type { CommonEditorProps } from './types';
import type { SandboxInstance } from './useSandboxServices';

export interface LoadedEditorProps extends CommonEditorProps {
  readonly sandboxInstance: SandboxInstance;
  readonly webLinter: WebLinter;
}

export const LoadedEditor: React.FC<LoadedEditorProps> = ({
  code,
  tsconfig,
  eslintrc,
  selectedRange,
  fileType,
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
    const newPath = `/input${fileType}`;
    if (tabs.code.uri.path !== newPath) {
      const newModel = sandboxInstance.monaco.editor.createModel(
        tabs.code.getValue(),
        undefined,
        sandboxInstance.monaco.Uri.file(newPath),
      );
      newModel.updateOptions({ tabSize: 2, insertSpaces: true });
      if (tabs.code.isAttachedToEditor()) {
        sandboxInstance.editor.setModel(newModel);
      }
      tabs.code.dispose();
      tabs.code = newModel;
    }
  }, [fileType, sandboxInstance.editor, sandboxInstance.monaco, tabs]);

  useEffect(() => {
    const config = createCompilerOptions(
      parseTSConfig(tsconfig).compilerOptions,
    );
    webLinter.updateCompilerOptions(config);
    sandboxInstance.setCompilerSettings(
      config as Monaco.languages.typescript.CompilerOptions,
    );
  }, [sandboxInstance, tsconfig, webLinter]);

  useEffect(() => {
    webLinter.updateEslintConfig(parseESLintRC(eslintrc));
  }, [eslintrc, webLinter]);

  useEffect(() => {
    sandboxInstance.editor.setModel(tabs[activeTab]);
    updateMarkers();
  }, [activeTab, sandboxInstance.editor, tabs, updateMarkers]);

  useEffect(() => {
    const lintEditor = debounce(() => {
      console.info('[Editor] linting triggered');

      webLinter.updateParserOptions(sourceType);

      try {
        const messages = webLinter.lint(code, tabs.code.uri.path);

        const markers = parseLintResults(messages, codeActions, ruleId =>
          sandboxInstance.monaco.Uri.parse(
            webLinter.rulesMap.get(ruleId)?.url ?? '',
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

      const position = sandboxInstance.editor.getPosition();
      onSelect(position ? tabs.code.getOffsetAt(position) : undefined);
    }, 500);

    lintEditor();
  }, [
    code,
    fileType,
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
      enableSchemaRequest: false,
      allowComments: true,
      schemas: [
        {
          uri: sandboxInstance.monaco.Uri.file('eslint-schema.json').toString(), // id of the first schema
          fileMatch: [tabs.eslintrc.uri.toString()], // associate with our model
          schema: getEslintJsonSchema(webLinter),
        },
        {
          uri: sandboxInstance.monaco.Uri.file('ts-schema.json').toString(), // id of the first schema
          fileMatch: [tabs.tsconfig.uri.toString()], // associate with our model
          schema: getTypescriptJsonSchema(),
        },
      ],
    });

    const subscriptions = [
      sandboxInstance.monaco.languages.registerCodeActionProvider(
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
              console.info('[Editor] updating cursor', position);
              onSelect(tabs.code.getOffsetAt(position));
            }
          }
        }, 150),
      ),
      sandboxInstance.editor.addAction({
        id: 'fix-eslint-problems',
        label: 'Fix eslint problems',
        keybindings: [
          sandboxInstance.monaco.KeyMod.CtrlCmd |
            sandboxInstance.monaco.KeyCode.KeyS,
        ],
        contextMenuGroupId: 'snippets',
        contextMenuOrder: 1.5,
        run(editor) {
          const editorModel = editor.getModel();
          if (editorModel) {
            const fixed = webLinter.fix(
              editor.getValue(),
              editorModel.uri.path,
            );
            if (fixed.fixed) {
              editorModel.pushEditOperations(
                null,
                [
                  {
                    range: editorModel.getFullModelRange(),
                    text: fixed.output,
                  },
                ],
                () => null,
              );
            }
          }
        },
      }),
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
    onChange,
    onSelect,
    sandboxInstance.editor,
    sandboxInstance.monaco.editor,
    sandboxInstance.monaco.languages.json.jsonDefaults,
    tabs.code,
    tabs.eslintrc,
    tabs.tsconfig,
    updateMarkers,
    webLinter.rulesMap,
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
        selectedRange && showAST
          ? [
              {
                range: sandboxInstance.monaco.Range.fromPositions(
                  tabs.code.getPositionAt(selectedRange[0]),
                  tabs.code.getPositionAt(selectedRange[1]),
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
  }, [selectedRange, sandboxInstance, showAST, tabs.code]);

  return null;
};
