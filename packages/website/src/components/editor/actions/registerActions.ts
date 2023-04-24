import type * as Monaco from 'monaco-editor';

import type { CreateLinter } from '../../linter/createLinter';
import { applyEdit } from './utils';

export function registerActions(
  monaco: typeof Monaco,
  editor: Monaco.editor.IStandaloneCodeEditor,
  linter: CreateLinter,
): Monaco.IDisposable {
  const disposable = [
    editor.addAction({
      id: 'fix-eslint-problems',
      label: 'Fix eslint problems',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      contextMenuGroupId: 'snippets',
      contextMenuOrder: 1.5,
      run(editor) {
        const editorModel = editor.getModel();
        if (editorModel) {
          const fixed = linter.triggerFix(editorModel.uri.path);
          if (fixed) {
            applyEdit(editorModel, editor, {
              range: editorModel.getFullModelRange(),
              text: fixed.output,
            });
          }
        }
      },
    }),
  ];

  return {
    dispose(): void {
      disposable.forEach(d => d.dispose());
    },
  };
}
