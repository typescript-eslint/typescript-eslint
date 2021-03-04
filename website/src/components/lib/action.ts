import type { languages } from 'monaco-editor';
import { createURI } from './utils';

export function createQuickfixCodeAction(
  title: string,
  marker,
  model,
  fix,
): languages.CodeAction {
  const start = model.getPositionAt(fix.range[0]);
  const end = model.getPositionAt(fix.range[1]);
  return {
    title,
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
            text: fix.text,
          },
        },
      ],
    },
  };
}

export function createProvideCodeActions(
  fixes: Map<string, any>,
): languages.CodeActionProvider {
  return {
    provideCodeActions(model, _range, context, _token) {
      if (context.only !== 'quickfix') {
        return {
          actions: [],
          dispose() {
            /* nop */
          },
        };
      }
      const actions: languages.CodeAction[] = [];
      for (const marker of context.markers) {
        const message = fixes.get(createURI(marker));
        if (!message) {
          continue;
        }
        if (message.fix) {
          actions.push(
            createQuickfixCodeAction(
              `Fix this ${message.ruleId} problem`,
              marker,
              model,
              message.fix,
            ),
          );
        }
        if (message.suggestions) {
          for (const suggestion of message.suggestions) {
            actions.push(
              createQuickfixCodeAction(
                `${suggestion.desc} (${message.ruleId})`,
                marker,
                model,
                suggestion.fix,
              ),
            );
          }
        }
      }
      return {
        actions,
        dispose() {
          /* nop */
        },
      };
    },
  };
}
