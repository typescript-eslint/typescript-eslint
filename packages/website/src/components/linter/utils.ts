import type { TSESLint } from '@typescript-eslint/utils';
import type Monaco from 'monaco-editor';

import type { ErrorGroup } from '../types';

export interface LintCodeAction {
  code?: string | null;
  fix: {
    range: Readonly<[number, number]>;
    text: string;
  };
  isPreferred: boolean;
  message: string;
}

export function ensurePositiveInt(
  value: number | undefined,
  defaultValue: number,
): number {
  return Math.max(1, (value ?? defaultValue) | 0);
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
    range: {
      endColumn: end.column,
      endLineNumber: end.lineNumber,
      startColumn: start.column,
      startLineNumber: start.lineNumber,
    },
    text: action.fix.text,
  };
}

function normalizeCode(code: Monaco.editor.IMarker['code']): {
  target?: string;
  value: string;
} {
  if (!code) {
    return { value: '' };
  }
  if (typeof code === 'string') {
    return { value: code };
  }
  return {
    target: code.target.toString(),
    value: code.value,
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
        fix(): void {
          const model = editor.getModel();
          if (model) {
            editor.executeEdits('eslint', [createEditOperation(model, item)]);
          }
        },
        isPreferred: item.isPreferred,
        message: item.message,
      })) ?? [];

    const group =
      marker.owner === 'eslint'
        ? code.value
        : marker.owner === 'typescript'
          ? 'TypeScript'
          : marker.owner;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    result[group] ||= {
      group,
      items: [],
      uri: code.target,
    };

    result[group].items.push({
      fixer: fixers.find(item => item.isPreferred),
      location: `${marker.startLineNumber}:${marker.startColumn} - ${marker.endLineNumber}:${marker.endColumn}`,
      message:
        (marker.owner !== 'eslint' && marker.owner !== 'json' && code.value
          ? `${code.value}: `
          : '') + marker.message,
      severity: marker.severity,
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
            target: ruleUri(message.ruleId),
            value: message.ruleId,
          }
        : 'Internal error',
      endColumn,
      endLineNumber,
      message: message.message,
      severity:
        message.severity === 2
          ? 8 // MarkerSeverity.Error
          : 4, // MarkerSeverity.Warning
      source: 'ESLint',
      startColumn,
      startLineNumber,
    };
    const markerUri = createURI(marker);

    const fixes: LintCodeAction[] = [];
    if (message.fix) {
      fixes.push({
        fix: message.fix,
        isPreferred: true,
        message: `Fix this ${message.ruleId ?? 'unknown'} problem`,
      });
    }
    if (message.suggestions) {
      for (const suggestion of message.suggestions) {
        fixes.push({
          code: message.ruleId,
          fix: suggestion.fix,
          isPreferred: false,
          message: suggestion.desc,
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

export function getPathRegExp(path: string): RegExp {
  const escapedPath = path.replaceAll('.', '\\.').replaceAll('*', '[^/]+');
  return new RegExp(`^${escapedPath}$`, '');
}
