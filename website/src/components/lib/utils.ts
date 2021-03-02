import JSON5 from 'json5';
import type { Linter } from 'eslint';
import type { ParserOptions } from '@typescript-eslint/parser';
import * as monaco from 'monaco-editor';

interface Options {
  rules?: Linter.RulesRecord;
  parserOptions?: ParserOptions;
  code?: string;
}

export function setQueryParams(state: Options): void {
  location.hash = btoa(encodeURIComponent(JSON5.stringify(state)));
}

export function getQueryParams(): Options {
  try {
    return JSON5.parse(
      decodeURIComponent(atob(location.hash.replace('#', ''))),
    );
  } catch {}
  return {};
}

const ensurePositiveInt = (value: number | undefined, defaultValue: number) => {
  return Math.max(1, (value !== undefined ? value : defaultValue) | 0);
};

export function messageToMarker(message): monaco.editor.IMarkerData {
  const startLineNumber = ensurePositiveInt(message.line, 1);
  const startColumn = ensurePositiveInt(message.column, 1);
  return {
    code: message.ruleId || 'FATAL',
    severity: monaco.MarkerSeverity.Error,
    source: 'ESLint',
    message: message.message,
    startLineNumber,
    startColumn,
    endLineNumber: ensurePositiveInt(message.endLine, startLineNumber),
    endColumn: ensurePositiveInt(message.endColumn, startColumn + 1),
  };
}
