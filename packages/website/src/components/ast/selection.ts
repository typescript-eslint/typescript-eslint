import type { TSESTree } from '@typescript-eslint/website-eslint';
import type { Position } from './types';

export const propsToFilter = ['parent', 'comments', 'tokens', 'loc'];

export function filterRecord(
  values: TSESTree.Node | Record<string, unknown>,
): [string, unknown][] {
  return Object.entries(values).filter(
    item => !propsToFilter.includes(item[0]),
  );
}

export function isNode(node: unknown): node is TSESTree.Node {
  return Boolean(
    typeof node === 'object' && node && 'type' in node && 'loc' in node,
  );
}

export function isWithinNode(
  loc: Position,
  start: Position,
  end: Position,
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
  position: Position | null | undefined,
  value: unknown,
): boolean {
  return Boolean(
    position &&
      isEsNode(value) &&
      isWithinNode(position, value.loc.start, value.loc.end),
  );
}

export function isArrayInRange(
  position: Position | null | undefined,
  value: unknown,
): boolean {
  return Boolean(
    position &&
      Array.isArray(value) &&
      value.some(item => isInRange(position, item)),
  );
}

export function hasChildInRange(
  position: Position | null | undefined,
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
