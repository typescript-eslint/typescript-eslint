import { useColorMode } from '@docusaurus/theme-common';
import type Monaco from 'monaco-editor';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { parseTSConfig, tryParseEslintModule } from '../config/utils';
import { useResizeObserver } from '../hooks/useResizeObserver';
import { debounce } from '../lib/debounce';
import type { LintCodeAction } from '../linter/utils';
import { parseLintResults, parseMarkers } from '../linter/utils';
import type { TabType } from '../types';
import {
  createCompilerOptions,
  getEslintSchema,
  getTsConfigSchema,
} from './config';
import { createProvideCodeActions } from './createProvideCodeActions';
import type { CommonEditorProps } from './types';
import type { SandboxServices } from './useSandboxServices';

export type LoadedEditorProps = CommonEditorProps & SandboxServices;

function applyEdit(
  model: Monaco.editor.ITextModel,
  editor: Monaco.editor.ICodeEditor,
  edit: Monaco.editor.IIdentifiedSingleEditOperation,
): void {
  if (model.isAttachedToEditor()) {
    editor.executeEdits('eslint', [edit]);
  } else {
    model.pushEditOperations([], [edit], () => null);
  }
}

export const LoadedEditor: React.FC<LoadedEditorProps> = ({
  code,
  tsconfig,
  eslintrc,
  decoration,
  jsx,
  onEsASTChange,
  onScopeChange,
  onTsASTChange,
  onMarkersChange,
  onChange,
  onSelect,
  sandboxInstance: { editor, monaco },
  showAST,
  system,
  webLinter,
  sourceType,
  activeTab,
}) => {
  const { colorMode } = useColorMode();
  const [_, setDecorations] = useState<string[]>([]);

  const codeActions = useRef(new Map<string, LintCodeAction[]>()).current;
  const [tabs] = useState<Record<TabType, Monaco.editor.ITextModel>>(() => {
    const tabsDefault = {
      code: editor.getModel()!,
      tsconfig: monaco.editor.createModel(
        tsconfig,
        'json',
        monaco.Uri.file('/tsconfig.json'),
      ),
      eslintrc: monaco.editor.createModel(
        eslintrc,
        'json',
        monaco.Uri.file('/.eslintrc'),
      ),
    };
    tabsDefault.code.updateOptions({ tabSize: 2, insertSpaces: true });
    tabsDefault.eslintrc.updateOptions({ tabSize: 2, insertSpaces: true });
    tabsDefault.tsconfig.updateOptions({ tabSize: 2, insertSpaces: true });
    return tabsDefault;
  });

  const updateMarkers = useCallback(() => {
    const model = editor.getModel()!;
    const markers = monaco.editor.getModelMarkers({
      resource: model.uri,
    });
    onMarkersChange(parseMarkers(markers, codeActions, editor));
  }, [codeActions, onMarkersChange, editor, monaco.editor]);

  useEffect(() => {
    webLinter.updateParserOptions(jsx, sourceType);
  }, [webLinter, jsx, sourceType]);

  useEffect(() => {
    const newPath = `/input.${jsx ? 'tsx' : 'ts'}`;
    if (tabs.code.uri.path !== newPath) {
      const code = tabs.code.getValue();
      const newModel = monaco.editor.createModel(
        code,
        'typescript',
        monaco.Uri.file(newPath),
      );
      newModel.updateOptions({ tabSize: 2, insertSpaces: true });
      if (tabs.code.isAttachedToEditor()) {
        editor.setModel(newModel);
      }
      tabs.code.dispose();
      tabs.code = newModel;
      system.writeFile(newPath, code);
    }
  }, [jsx, editor, system, monaco, tabs]);

  useEffect(() => {
    const config = createCompilerOptions(
      parseTSConfig(tsconfig).compilerOptions,
    );
    // @ts-expect-error - monaco and ts compilerOptions are not the same
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions(config);
  }, [monaco, tsconfig]);

  useEffect(() => {
    if (editor.getModel()?.uri.path !== tabs[activeTab].uri.path) {
      editor.setModel(tabs[activeTab]);
      updateMarkers();
    }
  }, [activeTab, editor, tabs, updateMarkers]);

  useEffect(() => {
    const disposable = webLinter.onLint((uri, messages) => {
      const diagnostics = parseLintResults(messages, codeActions, ruleId =>
        monaco.Uri.parse(webLinter.rules.get(ruleId)?.url ?? ''),
      );
      monaco.editor.setModelMarkers(
        monaco.editor.getModel(monaco.Uri.file(uri))!,
        'eslint',
        diagnostics,
      );
      updateMarkers();
    });
    return () => disposable();
  }, [webLinter, monaco, codeActions, updateMarkers]);

  useEffect(() => {
    const disposable = webLinter.onParse((uri, model) => {
      onEsASTChange(model.storedAST);
      onScopeChange(model.storedScope as Record<string, unknown> | undefined);
      onTsASTChange(model.storedTsAST);
    });
    return () => disposable();
  }, [webLinter, onEsASTChange, onScopeChange, onTsASTChange]);

  useEffect(() => {
    // configure the JSON language support with schemas and schema associations
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      enableSchemaRequest: false,
      allowComments: true,
      schemas: [
        {
          uri: monaco.Uri.file('eslint-schema.json').toString(), // id of the first schema
          fileMatch: ['/.eslintrc'], // associate with our model
          schema: getEslintSchema(Array.from(webLinter.rules.values())),
        },
        {
          uri: monaco.Uri.file('ts-schema.json').toString(), // id of the first schema
          fileMatch: ['/tsconfig.json'], // associate with our model
          schema: getTsConfigSchema(),
        },
      ],
    });
  }, [monaco, webLinter.rules]);

  useEffect(() => {
    const disposable = monaco.languages.registerCodeActionProvider(
      'typescript',
      createProvideCodeActions(codeActions),
    );
    return () => disposable.dispose();
  }, [codeActions, monaco]);

  useEffect(() => {
    const disposable = editor.onDidPaste(() => {
      if (tabs.eslintrc.isAttachedToEditor()) {
        const value = tabs.eslintrc.getValue();
        const newValue = tryParseEslintModule(value);
        if (newValue !== value) {
          tabs.eslintrc.setValue(newValue);
        }
      }
    });
    return () => disposable.dispose();
  }, [editor, tabs.eslintrc]);

  useEffect(() => {
    const disposable = editor.onDidChangeCursorPosition(
      debounce(() => {
        if (tabs.code.isAttachedToEditor()) {
          const position = editor.getPosition();
          if (position) {
            console.info('[Editor] updating cursor', position);
            onSelect(position);
          }
        }
      }, 150),
    );
    return () => disposable.dispose();
  }, [onSelect, editor, tabs.code]);

  useEffect(() => {
    const disposable = editor.addAction({
      id: 'fix-eslint-problems',
      label: 'Fix eslint problems',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      contextMenuGroupId: 'snippets',
      contextMenuOrder: 1.5,
      run(editor) {
        const editorModel = editor.getModel();
        if (editorModel) {
          const fixed = webLinter.triggerFix(editor.getValue());
          if (fixed?.fixed) {
            applyEdit(editorModel, editor, {
              range: editorModel.getFullModelRange(),
              text: fixed.output,
            });
          }
        }
      },
    });
    return () => disposable.dispose();
  }, [editor, monaco, webLinter]);

  useEffect(() => {
    const closable = [
      system.watchFile('/tsconfig.json', filename => {
        onChange({ tsconfig: system.readFile(filename) });
      }),
      system.watchFile('/.eslintrc', filename => {
        onChange({ eslintrc: system.readFile(filename) });
      }),
      system.watchFile('/input.*', filename => {
        onChange({ code: system.readFile(filename) });
      }),
    ];

    return () => {
      closable.forEach(c => c.close());
    };
  }, [system, onChange]);

  useEffect(() => {
    const disposable = editor.onDidChangeModelContent(() => {
      const model = editor.getModel();
      if (model) {
        system.writeFile(model.uri.path, model.getValue());
      }
    });
    return () => disposable.dispose();
  }, [editor, system]);

  useEffect(() => {
    const disposable = monaco.editor.onDidChangeMarkers(() => {
      updateMarkers();
    });
    return () => disposable.dispose();
  }, [monaco.editor, updateMarkers]);

  const resize = useMemo(() => {
    return debounce(() => editor.layout(), 1);
  }, [editor]);

  const container = editor.getContainerDomNode?.() ?? editor.getDomNode();

  useResizeObserver(container, () => {
    resize();
  });

  useEffect(() => {
    if (!editor.hasTextFocus() && code !== tabs.code.getValue()) {
      applyEdit(tabs.code, editor, {
        range: tabs.code.getFullModelRange(),
        text: code,
      });
    }
  }, [code, editor, tabs.code]);

  useEffect(() => {
    if (!editor.hasTextFocus() && tsconfig !== tabs.tsconfig.getValue()) {
      applyEdit(tabs.tsconfig, editor, {
        range: tabs.tsconfig.getFullModelRange(),
        text: tsconfig,
      });
    }
  }, [editor, tabs.tsconfig, tsconfig]);

  useEffect(() => {
    if (!editor.hasTextFocus() && eslintrc !== tabs.eslintrc.getValue()) {
      applyEdit(tabs.eslintrc, editor, {
        range: tabs.eslintrc.getFullModelRange(),
        text: eslintrc,
      });
    }
  }, [eslintrc, editor, tabs.eslintrc]);

  useEffect(() => {
    monaco.editor.setTheme(colorMode === 'dark' ? 'vs-dark' : 'vs-light');
  }, [colorMode, monaco]);

  useEffect(() => {
    setDecorations(prevDecorations =>
      tabs.code.deltaDecorations(
        prevDecorations,
        decoration && showAST
          ? [
              {
                range: new monaco.Range(
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
  }, [decoration, monaco, showAST, tabs.code]);

  useEffect(() => {
    if (activeTab === 'code') {
      webLinter.triggerLint(tabs.code.uri.path);
    }
  }, [webLinter, jsx, sourceType, activeTab, tabs.code]);

  return null;
};
