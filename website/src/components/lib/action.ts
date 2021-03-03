import * as monaco from 'monaco-editor';

export function createURI(marker) {
  return `[${[
    marker.startLineNumber,
    marker.startColumn,
    marker.startColumn,
    marker.endLineNumber,
    marker.endColumn,
    (typeof marker.code === 'string'
      ? marker.code
      : marker.code && marker.code.value) || '',
  ].join('|')}]`;
}

export function createQuickfixCodeAction(
  title: string,
  marker,
  model,
  fix,
): monaco.languages.CodeAction {
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

export function registerCodeActionProvider(
  language: string,
  fixes: Map<string, any>,
) {
  return monaco.languages.registerCodeActionProvider(language, {
    provideCodeActions(model, _range, context, _token) {
      if (context.only !== 'quickfix') {
        return {
          actions: [],
          dispose() {
            /* nop */
          },
        };
      }
      const actions: monaco.languages.CodeAction[] = [];
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
  });
}
