import { useColorMode } from '@docusaurus/theme-common';
import type Monaco from 'monaco-editor';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useResizeObserver } from '../hooks/useResizeObserver';
import { createCompilerOptions } from '../lib/createCompilerOptions';
import { debounce } from '../lib/debounce';
import {
  getEslintJsonSchema,
  getRuleJsonSchemaWithErrorLevel,
  getTypescriptJsonSchema,
} from '../lib/jsonSchema';
import { parseTSConfig, tryParseEslintModule } from '../lib/parseConfig';
import type { LintCodeAction } from '../linter/utils';
import { parseLintResults, parseMarkers } from '../linter/utils';
import type { TabType } from '../types';
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
  selectedRange,
  fileType,
  onEsASTChange,
  onScopeChange,
  onTsASTChange,
  onMarkersChange,
  onChange,
  onSelect,
  sandboxInstance: { editor, monaco },
  showAST,
  system,
  sourceType,
  webLinter,
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
    webLinter.updateParserOptions(sourceType);
  }, [webLinter, sourceType]);

  useEffect(() => {
    const newPath = `/input${fileType}`;
    if (tabs.code.uri.path !== newPath) {
      const code = tabs.code.getValue();
      const newModel = monaco.editor.createModel(
        code,
        undefined,
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
  }, [fileType, editor, system, monaco, tabs]);

  useEffect(() => {
    const config = createCompilerOptions(
      parseTSConfig(tsconfig).compilerOptions,
    );
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
      config as Monaco.languages.typescript.CompilerOptions,
    );
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
    const createRuleUri = (name: string): string =>
      monaco.Uri.parse(`/rules/${name.replace('@', '')}.json`).toString();

    // configure the JSON language support with schemas and schema associations
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      enableSchemaRequest: false,
      allowComments: true,
      schemas: [
        ...Array.from(webLinter.rules.values()).map(rule => ({
          uri: createRuleUri(rule.name),
          schema: getRuleJsonSchemaWithErrorLevel(rule.schema),
        })),
        {
          uri: monaco.Uri.file('eslint-schema.json').toString(), // id of the first schema
          fileMatch: ['/.eslintrc'], // associate with our model
          schema: getEslintJsonSchema(webLinter, createRuleUri),
        },
        {
          uri: monaco.Uri.file('ts-schema.json').toString(), // id of the first schema
          fileMatch: ['/tsconfig.json'], // associate with our model
          schema: getTypescriptJsonSchema(),
        },
      ],
    });
  }, [monaco, webLinter]);

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
      debounce(e => {
        if (tabs.code.isAttachedToEditor()) {
          const position = tabs.code.getOffsetAt(e.position);
          console.info('[Editor] updating cursor', position);
          onSelect(position);
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
        selectedRange && showAST
          ? [
              {
                range: monaco.Range.fromPositions(
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
  }, [selectedRange, monaco, showAST, tabs.code]);

  useEffect(() => {
    webLinter.triggerLint(tabs.code.uri.path);
  }, [webLinter, fileType, sourceType, tabs.code]);

  return null;
};
