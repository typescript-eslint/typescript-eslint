import type { languages, editor } from 'monaco-editor';
import type { Linter } from '@typescript-eslint/experimental-utils/dist/ts-eslint/Linter';
import type { RuleFix } from '@typescript-eslint/experimental-utils/dist/ts-eslint/Rule';
import { createURI } from './utils';

export function createQuickfixCodeAction(
  title: string,
  marker: editor.IMarkerData,
  model: editor.ITextModel,
  fix: RuleFix,
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
  fixes: Map<string, Linter.LintMessage>,
): languages.CodeActionProvider {
  return {
    provideCodeActions(
      model,
      _range,
      context,
      _token,
    ): languages.ProviderResult<languages.CodeActionList> {
      if (context.only !== 'quickfix') {
        return {
          actions: [],
          dispose(): void {
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
              `Fix this ${message.ruleId ?? 'unknown'} problem`,
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
                `${suggestion.desc} (${message.ruleId ?? 'unknown'})`,
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
        dispose(): void {
          /* nop */
        },
      };
    },
  };
}
