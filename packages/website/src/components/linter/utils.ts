import type Monaco from 'monaco-editor';

export function ensurePositiveInt(
  value: number | undefined,
  defaultValue: number,
): number {
  return Math.max(1, (value !== undefined ? value : defaultValue) | 0);
}

export function createURI(marker: Monaco.editor.IMarkerData): string {
  return `[${[
    marker.startLineNumber,
    marker.startColumn,
    marker.startColumn,
    marker.endLineNumber,
    marker.endColumn,
    (typeof marker.code === 'string' ? marker.code : marker.code?.value) ?? '',
  ].join('|')}]`;
}
