import { useColorMode } from '@docusaurus/theme-common';
import Editor from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';
import React, { useEffect, useRef, useState } from 'react';

import { addLibFiles } from '../linter/bridge';
import { createLinter } from '../linter/createLinter';
import type { WebLinterModule } from '../linter/types';
import { defaultEditorOptions } from '../options';
import { createModels, determineLanguage } from './actions/createModels';
import { registerActions } from './actions/registerActions';
import { registerDefaults } from './actions/registerDefaults';
import { registerEvents } from './actions/registerEvents';
import { registerLinter } from './actions/registerLinter';
import type { LintCodeAction } from './actions/utils';
import { isCodeFile } from './actions/utils';
import type { LoadingEditorProps } from './LoadingEditor';

interface LoadedEditorProps extends LoadingEditorProps {
  monaco: typeof Monaco;
  utils: WebLinterModule;
}

export default function LoadedEditor({
  activeFile,
  system,
  onValidate,
  onUpdate,
  onCursorChange,
  monaco,
  className,
  utils,
  selectedRange,
}: LoadedEditorProps): JSX.Element {
  const { colorMode } = useColorMode();
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor>();
  const [, setDecorations] = useState<string[]>([]);
  const [defaultValue] = useState(
    () => system.readFile('/' + activeFile) ?? '',
  );

  useEffect(() => {
    const model = monaco.editor.getModel(monaco.Uri.file(activeFile));
    if (model) {
      setDecorations(prevDecorations =>
        model.deltaDecorations(
          prevDecorations,
          selectedRange
            ? [
                {
                  range: monaco.Range.fromPositions(
                    model.getPositionAt(selectedRange[0]),
                    model.getPositionAt(selectedRange[1]),
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
  }, [selectedRange, monaco, activeFile]);

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    const activeUri = monaco.Uri.file(activeFile);
    let model = monaco.editor.getModel(activeUri);
    if (!model) {
      console.log('[Editor] creating new model', activeUri.path);
      let code: string | undefined = '';
      if (isCodeFile(activeUri.path)) {
        const codeModel = monaco.editor
          .getModels()
          .find(m => isCodeFile(m.uri.path));
        if (codeModel) {
          code = codeModel.getValue();
          console.log('[Editor] destroying model', codeModel.uri.path);
          codeModel.dispose();
        }
        system.writeFile(activeUri.path, code ?? '');
      } else {
        code = system.readFile(activeUri.path);
      }
      model = monaco.editor.createModel(
        code ?? '',
        determineLanguage(activeUri.path),
        activeUri,
      );
      model.updateOptions({ tabSize: 2, insertSpaces: true });
    }

    if (!model.isAttachedToEditor()) {
      console.log('[Editor] attaching model', activeUri.path);
      editorRef.current.setModel(model);
    }

    monaco.editor.setModelLanguage(model, determineLanguage(activeUri.path));
  }, [system, monaco, editorRef, activeFile]);

  const onEditorDidMount = (
    editor: Monaco.editor.IStandaloneCodeEditor,
  ): void => {
    editorRef.current = editor;
    window.esquery = utils.esquery;
    window.system = system;

    // we want to ignore this error
    void addLibFiles(system, monaco).then(() => {
      const globalActions = new Map<string, Map<string, LintCodeAction[]>>();
      const linter = createLinter(system, utils);
      registerDefaults(monaco, linter, system);
      createModels(monaco, editor, system);
      registerActions(monaco, editor, linter);
      registerEvents(
        monaco,
        editor,
        system,
        onValidate,
        onCursorChange,
        globalActions,
      );
      registerLinter(monaco, editor, linter, globalActions);

      const model = editor.getModel()!;
      model.updateOptions({ tabSize: 2, insertSpaces: true });
      monaco.editor.setModelLanguage(model, determineLanguage(activeFile));
      linter.onParse((_, updateModel) => {
        onUpdate(updateModel);
      });
    });
  };

  return (
    <Editor
      className={className}
      theme={colorMode === 'dark' ? 'vs-dark' : 'vs-light'}
      defaultPath={activeFile}
      defaultLanguage="typescript"
      defaultValue={defaultValue}
      onMount={onEditorDidMount}
      options={defaultEditorOptions}
    />
  );
}
