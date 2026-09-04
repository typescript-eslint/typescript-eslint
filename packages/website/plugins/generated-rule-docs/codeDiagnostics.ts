import type { Linter } from '@typescript-eslint/utils/ts-eslint';

export interface CodeDiagnostic {
  endColumn: number;
  endLine: number;
  message: string;
  startColumn: number;
  startLine: number;
}

export function lintMessagesToDiagnostics(
  messages: readonly Linter.LintMessage[],
): CodeDiagnostic[] {
  return messages.map(message => ({
    endColumn: (message.endColumn ?? message.column + 1) - 1,
    endLine: (message.endLine ?? message.line) - 1,
    message: message.message,
    startColumn: message.column - 1,
    startLine: message.line - 1,
  }));
}
