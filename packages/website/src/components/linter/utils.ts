import type Monaco from 'monaco-editor';
import type { ErrorItem } from '../types';
import { LintCodeAction } from './lintCode';

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

export function parseMarkers(
  markers: Monaco.editor.IMarker[],
  fixes: Map<string, LintCodeAction[]>,
  editor: Monaco.editor.IStandaloneCodeEditor,
): ErrorItem[] {
  return markers.map(marker => {
    const isTypescript = marker.owner === 'typescript';
    const code =
      typeof marker.code === 'string' ? marker.code : marker.code?.value ?? '';
    const uri = createURI(marker);

    const fixers =
      fixes.get(uri)?.map(item => {
        return {
          message: item.message,
          fix(): void {
            const model = editor.getModel()!;
            const start = model.getPositionAt(item.fix.range[0]);
            const end = model.getPositionAt(item.fix.range[1]);
            editor.executeEdits(model.getValue(), [
              {
                range: {
                  startLineNumber: start.lineNumber,
                  startColumn: start.column,
                  endLineNumber: end.lineNumber,
                  endColumn: end.column,
                },
                text: item.fix.text,
              },
            ]);
          },
        };
      }) ?? [];

    return {
      group: isTypescript ? marker.owner : code,
      message: (isTypescript ? `TS${code}: ` : '') + marker.message,
      location: `${marker.startLineNumber}:${marker.startColumn} - ${marker.endLineNumber}:${marker.endColumn}`,
      severity: marker.severity,
      hasFixers: fixers.length > 0,
      fixers: fixers,
    };
  });
}
