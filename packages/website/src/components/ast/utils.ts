import type { TSESTree } from '@typescript-eslint/website-eslint';
import type { SelectedPosition } from './types';

export const propsToFilter = [
  'parent',
  'comments',
  'tokens',
  // 'loc',
  'jsDoc',
  'lineMap',
  'externalModuleIndicator',
  'bindDiagnostics',
  'modifierFlagsCache',
  'transformFlags',
  'resolvedModules',
];

export function isWithinNode(
  loc: SelectedPosition,
  start: SelectedPosition,
  end: SelectedPosition,
): boolean {
  const canStart =
    start.line < loc.line ||
    (start.line === loc.line && start.column <= loc.column);
  const canEnd =
    end.line > loc.line || (end.line === loc.line && end.column >= loc.column);
  return canStart && canEnd;
}

export function objType(obj: unknown): string {
  const type = Object.prototype.toString.call(obj).slice(8, -1);
  // @ts-expect-error: this is correct check
  if (type === 'Object' && obj && typeof obj[Symbol.iterator] === 'function') {
    return 'Iterable';
  }

  return type;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return objType(value) === 'Object';
}

export function isEsNode(
  value: unknown,
): value is Record<string, unknown> & TSESTree.BaseNode {
  return isRecord(value) && 'type' in value && 'loc' in value;
}

export function isInRange(
  position: SelectedPosition | null | undefined,
  value: unknown,
): boolean {
  return Boolean(
    position &&
      isEsNode(value) &&
      isWithinNode(position, value.loc.start, value.loc.end),
  );
}

export function isArrayInRange(
  position: SelectedPosition | null | undefined,
  value: unknown,
): boolean {
  return Boolean(
    position &&
      Array.isArray(value) &&
      value.some(item => isInRange(position, item)),
  );
}

export function hasChildInRange(
  position: SelectedPosition | null | undefined,
  value: [string, unknown][],
): boolean {
  return Boolean(
    position &&
      value.some(
        ([, item]) =>
          isInRange(position, item) || isArrayInRange(position, item),
      ),
  );
}
