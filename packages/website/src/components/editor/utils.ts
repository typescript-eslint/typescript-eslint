import type Monaco from 'monaco-editor';
import { LintCodeAction } from '@site/src/components/editor/lintCode';
import type { ErrorItem } from '@site/src/components/types';

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
): ErrorItem[] {
  return markers.map(marker => {
    const isTypescript = marker.owner === 'typescript';
    const code =
      typeof marker.code === 'string' ? marker.code : marker.code?.value ?? '';

    return {
      group: isTypescript ? marker.owner : code,
      message: (isTypescript ? `TS${code}: ` : '') + marker.message,
      location: `${marker.startLineNumber}:${marker.startColumn} - ${marker.endLineNumber}:${marker.endColumn}`,
      severity: marker.severity,
      hasFixers: fixes.has(createURI(marker)), // TODO: expose fixers
    };
  });
}
