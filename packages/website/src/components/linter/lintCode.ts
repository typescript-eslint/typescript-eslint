import type { TSESLint } from '@typescript-eslint/utils';
import type Monaco from 'monaco-editor';
import type { WebLinter } from './WebLinter';
import { createURI, ensurePositiveInt } from './utils';

export interface LintCodeAction {
  message: string;
  fix: {
    range: Readonly<[number, number]>;
    text: string;
  };
}

export type LintCodeActionGroup = [string, LintCodeAction[]];

export function lintCode(
  linter: WebLinter,
  code: string,
  rules: TSESLint.Linter.RulesRecord | undefined,
  jsx?: boolean,
  sourceType?: 'module' | 'script',
): [Monaco.editor.IMarkerData[], string | undefined, LintCodeActionGroup[]] {
  const messages = linter.lint(
    code,
    {
      ecmaFeatures: {
        jsx: jsx ?? false,
        globalReturn: false,
      },
      ecmaVersion: 'latest',
      project: ['./tsconfig.json'],
      sourceType: sourceType ?? 'module',
    },
    rules ?? {},
  );
  const markers: Monaco.editor.IMarkerData[] = [];
  let fatalMessage: string | undefined = undefined;

  const codeActions: LintCodeActionGroup[] = [];

  for (const message of messages) {
    if (!message.ruleId) {
      fatalMessage = message.message;
    }
    const startLineNumber = ensurePositiveInt(message.line, 1);
    const startColumn = ensurePositiveInt(message.column, 1);
    const endLineNumber = ensurePositiveInt(message.endLine, startLineNumber);
    const endColumn = ensurePositiveInt(message.endColumn, startColumn + 1);

    const marker: Monaco.editor.IMarkerData = {
      code: message.ruleId ?? 'FATAL',
      severity: 8, // MarkerSeverity.Error,
      source: 'ESLint',
      message: message.message,
      startLineNumber,
      startColumn,
      endLineNumber,
      endColumn,
    };
    const markerUri = createURI(marker);

    const fixes: LintCodeAction[] = [];
    if (message.fix) {
      fixes.push({
        message: `Fix this ${message.ruleId ?? 'unknown'} problem`,
        fix: message.fix,
      });
    }
    if (message.suggestions) {
      for (const suggestion of message.suggestions) {
        fixes.push({
          message: `${suggestion.desc} (${message.ruleId ?? 'unknown'})`,
          fix: suggestion.fix,
        });
      }
    }
    if (fixes.length > 0) {
      codeActions.push([markerUri, fixes]);
    }
    markers.push(marker);
  }

  return [markers, fatalMessage, codeActions];
}
