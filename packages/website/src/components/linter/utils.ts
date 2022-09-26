import type { TSESLint } from '@typescript-eslint/utils';
import type Monaco from 'monaco-editor';

import type { ErrorGroup } from '../types';

export interface LintCodeAction {
  message: string;
  code?: string | null;
  isPreferred: boolean;
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

function normalizeCode(code: Monaco.editor.IMarker['code']): {
  value: string;
  target?: string;
} {
  if (!code) {
    return { value: '' };
  }
  if (typeof code === 'string') {
    return { value: code };
  }
  return {
    value: code.value,
    target: code.target.toString(),
  };
}

export function parseMarkers(
  markers: Monaco.editor.IMarker[],
  fixes: Map<string, LintCodeAction[]>,
  editor: Monaco.editor.IStandaloneCodeEditor,
): ErrorGroup[] {
  const result: Record<string, ErrorGroup> = {};
  for (const marker of markers) {
    const code = normalizeCode(marker.code);
    const uri = createURI(marker);

    const fixers =
      fixes.get(uri)?.map(item => ({
        message: item.message,
        isPreferred: item.isPreferred,
        fix(): void {
          editor.executeEdits('eslint', [
            createEditOperation(editor.getModel()!, item),
          ]);
        },
      })) ?? [];

    const group =
      marker.owner === 'eslint'
        ? code.value
        : marker.owner === 'typescript'
        ? 'TypeScript'
        : marker.owner;

    if (!result[group]) {
      result[group] = {
        group: group,
        uri: code.target,
        items: [],
      };
    }

    result[group].items.push({
      message:
        (marker.owner !== 'eslint' && code ? `${code.value}: ` : '') +
        marker.message,
      location: `${marker.startLineNumber}:${marker.startColumn} - ${marker.endLineNumber}:${marker.endColumn}`,
      severity: marker.severity,
      fixer: fixers.find(item => item.isPreferred),
      suggestions: fixers.filter(item => !item.isPreferred),
    });
  }

  return Object.values(result).sort((a, b) => a.group.localeCompare(b.group));
}

export function parseLintResults(
  messages: TSESLint.Linter.LintMessage[],
  codeActions: Map<string, LintCodeAction[]>,
  ruleUri: (ruleId: string) => Monaco.Uri,
): Monaco.editor.IMarkerData[] {
  const markers: Monaco.editor.IMarkerData[] = [];

  codeActions.clear();

  for (const message of messages) {
    const startLineNumber = ensurePositiveInt(message.line, 1);
    const startColumn = ensurePositiveInt(message.column, 1);
    const endLineNumber = ensurePositiveInt(message.endLine, startLineNumber);
    const endColumn = ensurePositiveInt(message.endColumn, startColumn + 1);

    const marker: Monaco.editor.IMarkerData = {
      code: message.ruleId
        ? {
            value: message.ruleId,
            target: ruleUri(message.ruleId),
          }
        : 'FATAL',
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
        isPreferred: true,
      });
    }
    if (message.suggestions) {
      for (const suggestion of message.suggestions) {
        fixes.push({
          message: suggestion.desc,
          code: message.ruleId,
          fix: suggestion.fix,
          isPreferred: false,
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
