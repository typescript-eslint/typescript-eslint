import type { ParserOptions } from '@typescript-eslint/parser';
import type { editor } from 'monaco-editor';

export interface QueryParamOptions {
  jsx?: boolean;
  sourceType?: ParserOptions['sourceType'];
  rules?: Record<string, unknown>;
  code?: string;
}

function writeQueryParam(value?: unknown): string {
  return btoa(encodeURIComponent(JSON.stringify(value)));
}

function readQueryParam(value: string): unknown {
  return JSON.parse(decodeURIComponent(atob(value)));
}

export function updateQueryParams(state: Partial<QueryParamOptions>): void {
  const params = getQueryParams();
  setQueryParams({ ...params, ...state });
}

export function setQueryParams(state: QueryParamOptions): void {
  const params: string[] = Object.entries({
    jsx: state.jsx,
    sourceType: state.sourceType,
    rules: state.rules ? writeQueryParam(state.rules) : undefined,
    code: state.code ? writeQueryParam(state.code) : undefined,
  })
    .filter(item => item[1])
    .map(item => `${encodeURIComponent(item[0])}=${item[1]}`);
  if (location.hash !== '#' + params.join('&')) {
    location.hash = '#' + params.join('&');
  }
}

export function getQueryParams(): QueryParamOptions {
  try {
    const searchParams = new URLSearchParams(location.hash.replace('#', ''));
    return {
      jsx: searchParams.has('jsx'),
      sourceType:
        searchParams.has('sourceType') &&
        searchParams.get('sourceType') === 'script'
          ? 'script'
          : 'module',
      code: searchParams.has('code')
        ? (readQueryParam(searchParams.get('code')!) as string)
        : undefined,
      rules: searchParams.has('rules')
        ? (readQueryParam(
            searchParams.get('rules')!,
          ) as QueryParamOptions['rules'])
        : undefined,
    };
  } catch {
    // eslint-disable-next-line no-console
    console.warn('Error while loading query params');
  }
  return {};
}

const ensurePositiveInt = (
  value: number | undefined,
  defaultValue: number,
): number => {
  return Math.max(1, (value !== undefined ? value : defaultValue) | 0);
};

export function messageToMarker(message): editor.IMarkerData {
  const startLineNumber = ensurePositiveInt(message.line, 1);
  const startColumn = ensurePositiveInt(message.column, 1);
  return {
    code: message.ruleId || 'FATAL',
    severity: 8, // MarkerSeverity.Error,
    source: 'ESLint',
    message: message.message,
    startLineNumber,
    startColumn,
    endLineNumber: ensurePositiveInt(message.endLine, startLineNumber),
    endColumn: ensurePositiveInt(message.endColumn, startColumn + 1),
  };
}

export function createURI(marker): string {
  return `[${[
    marker.startLineNumber,
    marker.startColumn,
    marker.startColumn,
    marker.endLineNumber,
    marker.endColumn,
    (typeof marker.code === 'string' ? marker.code : marker.code?.value) || '',
  ].join('|')}]`;
}
