import type { TSESTree } from '@typescript-eslint/website-eslint';
import type { SelectedPosition } from '../types';

export const propsToFilter = ['parent', 'comments', 'tokens', 'loc'];

export function filterRecord(
  values: Record<string, unknown>,
): [string, unknown][] {
  return Object.entries(values).filter(
    item => !propsToFilter.includes(item[0]),
  );
}

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

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(
    typeof value === 'object' && value && value.constructor === Object,
  );
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
  value: unknown,
): boolean {
  return Boolean(
    position &&
      isEsNode(value) &&
      filterRecord(value).some(
        ([, item]) =>
          isInRange(position, item) || isArrayInRange(position, item),
      ),
  );
}
