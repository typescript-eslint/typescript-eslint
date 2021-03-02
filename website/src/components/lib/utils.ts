import type { Linter } from 'eslint';
import type { ParserOptions } from '@typescript-eslint/parser';
import type { editor } from 'monaco-editor';
import { MarkerSeverity } from 'monaco-editor';

interface Options {
  rules?: Linter.RulesRecord;
  parserOptions?: ParserOptions;
  code?: string;
}

function writeQueryParam(value?: any) {
  return btoa(encodeURIComponent(JSON.stringify(value)));
}

function readQueryParam(value?: any) {
  return JSON.parse(decodeURIComponent(atob(value)));
}

export function setQueryParams(state?: Options): void {
  const params: string[] = Object.entries(state)
    .filter(item => item[1])
    .map(item => `${encodeURIComponent(item[0])}=${writeQueryParam(item[1])}`);
  if (location.hash !== '#' + params.join('&')) {
    location.hash = '#' + params.join('&');
  }
}

export function getQueryParams(): Options {
  try {
    const searchParams = new URLSearchParams(location.hash.replace('#', ''));
    return {
      rules: searchParams.has('rules')
        ? readQueryParam(searchParams.get('rules'))
        : undefined,
      parserOptions: searchParams.has('parserOptions')
        ? readQueryParam(searchParams.get('parserOptions'))
        : undefined,
      code: searchParams.has('code')
        ? readQueryParam(searchParams.get('code'))
        : undefined,
    };
  } catch {}
  return {};
}

const ensurePositiveInt = (value: number | undefined, defaultValue: number) => {
  return Math.max(1, (value !== undefined ? value : defaultValue) | 0);
};

export function messageToMarker(message): editor.IMarkerData {
  const startLineNumber = ensurePositiveInt(message.line, 1);
  const startColumn = ensurePositiveInt(message.column, 1);
  return {
    code: message.ruleId || 'FATAL',
    severity: MarkerSeverity.Error,
    source: 'ESLint',
    message: message.message,
    startLineNumber,
    startColumn,
    endLineNumber: ensurePositiveInt(message.endLine, startLineNumber),
    endColumn: ensurePositiveInt(message.endColumn, startColumn + 1),
  };
}
