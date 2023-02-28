import type Monaco from 'monaco-editor';

import type { LintCodeAction } from '../linter/utils';
import { createEditOperation, createURI } from '../linter/utils';

export function createProvideCodeActions(
  fixes: Map<string, LintCodeAction[]>,
): Monaco.languages.CodeActionProvider {
  return {
    provideCodeActions(
      model,
      _range,
      context,
      _token,
    ): Monaco.languages.ProviderResult<Monaco.languages.CodeActionList> {
      if (context.only !== 'quickfix') {
        return {
          actions: [],
          dispose(): void {
            /* nop */
          },
        };
      }
      const actions: Monaco.languages.CodeAction[] = [];
      for (const marker of context.markers) {
        const messages = fixes.get(createURI(marker)) ?? [];
        for (const message of messages) {
          const editOperation = createEditOperation(model, message);

          actions.push({
            title: message.message + (message.code ? ` (${message.code})` : ''),
            diagnostics: [marker],
            kind: 'quickfix',
            isPreferred: message.isPreferred,
            edit: {
              edits: [
                {
                  resource: model.uri,
                  // monaco for ts >= 4.8
                  textEdit: editOperation,
                  // @ts-expect-error monaco for ts < 4.8
                  edit: editOperation,
                },
              ],
            },
          });
        }
      }
      return {
        actions,
        dispose(): void {
          /* nop */
        },
      };
    },
  };
}
