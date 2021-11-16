/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { TSESTree } from '@typescript-eslint/website-eslint';

export const propsToFilter = ['parent', 'comments', 'tokens', 'loc'];

export interface Position {
  line: number;
  column: number;
}

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

export function findNode(
  loc: Position,
  node: TSESTree.Node,
): TSESTree.Node | null {
  if (isNode(node) && isWithinNode(loc, node.loc.start, node.loc.end)) {
    for (const it in node) {
      if (!propsToFilter.includes(it)) {
        const nodeEl =
          node[
            it as Exclude<
              keyof typeof node,
              'parent' | 'comments' | 'tokens' | 'loc'
            >
          ]!;
        if (Array.isArray(nodeEl)) {
          const isFound2 = nodeEl.find(
            e => isNode(e) && isWithinNode(loc, e.loc.start, e.loc.end),
          );
          if (isFound2) {
            // @ts-ignore
            return findNode(loc, isFound2);
          }
        } else {
          // @ts-ignore
          const isFound = findNode(loc, nodeEl);
          if (isFound) {
            return isFound;
          }
        }
      }
    }
    return node;
  }
  return null;
}
