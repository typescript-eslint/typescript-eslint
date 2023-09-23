import type { TSESLint } from '@typescript-eslint/utils';
import type * as Monaco from 'monaco-editor';

import { toJson } from '../../lib/json';

export interface LintCodeAction {
  message: string;
  code?: string | null;
  isPreferred: boolean;
  fix: {
    range: Readonly<[number, number]>;
    text: string;
  };
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
): Monaco.languages.TextEdit {
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

export function applyEdit(
  model: Monaco.editor.ITextModel,
  editor: Monaco.editor.ICodeEditor,
  edit: Monaco.editor.IIdentifiedSingleEditOperation,
): void {
  if (model.isAttachedToEditor()) {
    editor.executeEdits('eslint', [edit]);
  } else {
    model.pushEditOperations([], [edit], () => null);
  }
}

export function createEditAction(
  monaco: typeof Monaco,
  model: Monaco.editor.ITextModel,
  fix: TSESLint.RuleFix,
): Monaco.editor.IIdentifiedSingleEditOperation {
  return {
    text: fix.text,
    range: monaco.Range.fromPositions(
      model.getPositionAt(fix.range[0]),
      model.getPositionAt(fix.range[1]),
    ),
  };
}

export function normalizeMarkerCode(marker: Monaco.editor.IMarker): {
  value: string;
  target?: string;
} {
  if (!marker.code) {
    return { value: '' };
  }
  if (typeof marker.code === 'string') {
    return { value: marker.code };
  }
  return {
    value: marker.code.value,
    target: marker.code.target.toString(),
  };
}

export function normalizeMarkerGroup(marker: Monaco.editor.IMarker): string {
  if (marker.owner === 'eslint' && marker.code) {
    if (typeof marker.code === 'string') {
      return marker.code;
    }
    return marker.code.value;
  }
  return marker.owner === 'typescript'
    ? 'TypeScript'
    : marker.owner === 'javascript'
    ? 'JavaScript'
    : marker.owner;
}

const moduleRegexp = /(module\.exports\s*=)/g;

function constrainedScopeEval(obj: string): unknown {
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  return new Function(`
    "use strict";
    var module = { exports: {} };
    (${obj});
    return module.exports
  `)();
}

export function tryParseEslintModule(value: string): string | null {
  try {
    if (moduleRegexp.test(value)) {
      const newValue = toJson(constrainedScopeEval(value));
      if (newValue !== value) {
        return newValue;
      }
    }
  } catch (e) {
    console.error(e);
  }
  return null;
}

export function isCodeFile(fileName: string): boolean {
  return /^\/input\.[cm]?(tsx?|jsx?|d\.ts)$/.test(fileName);
}
