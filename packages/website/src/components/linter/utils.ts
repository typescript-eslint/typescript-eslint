import type Monaco from 'monaco-editor';
import type { ErrorItem } from '../types';
import type { TSESLint } from '@typescript-eslint/utils';

export interface LintCodeAction {
  message: string;
  fix: {
    range: Readonly<[number, number]>;
    text: string;
  };
}

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

export function createEditOperation(
  model: Monaco.editor.ITextModel,
  action: LintCodeAction,
): { range: Monaco.IRange; text: string } {
  const start = model.getPositionAt(action.fix.range[0]);
  const end = model.getPositionAt(action.fix.range[1]);
  return {
    text: action.fix.text,
    range: {
      startLineNumber: start.lineNumber,
      startColumn: start.column,
      endLineNumber: end.lineNumber,
      endColumn: end.column,
    },
  };
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
            editor.executeEdits(model.getValue(), [
              createEditOperation(model, item),
            ]);
          },
        };
      }) ?? [];

    return {
      group: isTypescript ? 'TypeScript' : code,
      message: (isTypescript ? `TS${code}: ` : '') + marker.message,
      location: `${marker.startLineNumber}:${marker.startColumn} - ${marker.endLineNumber}:${marker.endColumn}`,
      severity: marker.severity,
      hasFixers: fixers.length > 0,
      fixers: fixers,
    };
  });
}

export function parseLintResults(
  messages: TSESLint.Linter.LintMessage[],
  codeActions: Map<string, LintCodeAction[]>,
): Monaco.editor.IMarkerData[] {
  const markers: Monaco.editor.IMarkerData[] = [];

  codeActions.clear();

  for (const message of messages) {
    const startLineNumber = ensurePositiveInt(message.line, 1);
    const startColumn = ensurePositiveInt(message.column, 1);
    const endLineNumber = ensurePositiveInt(message.endLine, startLineNumber);
    const endColumn = ensurePositiveInt(message.endColumn, startColumn + 1);

    const marker: Monaco.editor.IMarkerData = {
      code: message.ruleId ?? 'FATAL',
      severity:
        message.severity === 2
          ? 8 // MarkerSeverity.Error
          : 4, // MarkerSeverity.Warning
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
      codeActions.set(markerUri, fixes);
    }

    markers.push(marker);
  }

  return markers;
}
