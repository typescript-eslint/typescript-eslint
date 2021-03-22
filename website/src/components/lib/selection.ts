import { TSESTree } from '@typescript-eslint/types';

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
        if (Array.isArray(node[it])) {
          let isFound2 = node[it].find(
            e => isNode(e) && isWithinNode(loc, e.loc.start, e.loc.end),
          );
          if (isFound2) {
            isFound2 = findNode(loc, isFound2);
            return isFound2;
          }
        } else {
          const isFound = findNode(loc, node[it]);
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
