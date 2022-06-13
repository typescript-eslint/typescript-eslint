import type Monaco from 'monaco-editor';
import {
  createEditOperation,
  createURI,
  LintCodeAction,
} from '../linter/utils';

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
          actions.push({
            title: message.message + (message.code ? ` (${message.code})` : ''),
            diagnostics: [marker],
            kind: 'quickfix',
            isPreferred: message.isPreferred,
            edit: {
              edits: [
                {
                  resource: model.uri,
                  edit: createEditOperation(model, message),
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
