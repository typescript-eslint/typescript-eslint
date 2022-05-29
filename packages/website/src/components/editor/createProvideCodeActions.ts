import type Monaco from 'monaco-editor';
import type { LintCodeAction } from '../linter/lintCode';
import { createURI } from '../linter/utils';

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
          const start = model.getPositionAt(message.fix.range[0]);
          const end = model.getPositionAt(message.fix.range[1]);
          actions.push({
            title: message.message,
            diagnostics: [marker],
            kind: 'quickfix',
            edit: {
              edits: [
                {
                  resource: model.uri,
                  edit: {
                    range: {
                      startLineNumber: start.lineNumber,
                      startColumn: start.column,
                      endLineNumber: end.lineNumber,
                      endColumn: end.column,
                    },
                    text: message.fix.text,
                  },
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
