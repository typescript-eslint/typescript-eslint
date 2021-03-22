import type { editor } from 'monaco-editor';

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
