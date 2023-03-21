import { isESNode, isRecord, isTSNode } from './utils';

function isInRange(offset: number, range: [number, number]): boolean {
  return offset > range[0] && offset <= range[1];
}

function getRangeFromNode(value: object): null | [number, number] {
  if (isESNode(value)) {
    return value.range;
  } else if (isTSNode(value)) {
    if (value.kind >= window.ts.SyntaxKind.FirstNode) {
      return [value.pos, value.end];
    }
  }
  return null;
}

function findInObject(
  iter: object,
  cursorPosition: number,
  visited: Set<unknown>,
): null | {
  key: string[];
  value: object;
} {
  const children = Object.entries(iter);
  for (const [name, child] of children) {
    // we do not want to select parents in case if we do filter with esquery
    if (visited.has(child) || name === 'parent') {
      continue;
    }
    visited.add(iter);

    if (isRecord(child)) {
      const range = getRangeFromNode(child);
      if (range && isInRange(cursorPosition, range)) {
        return {
          key: [name],
          value: child,
        };
      }
    } else if (Array.isArray(child)) {
      for (let index = 0; index < child.length; ++index) {
        const arrayChild: unknown = child[index];
        // typescript array like elements have other iterable items
        if (typeof index === 'number' && isRecord(arrayChild)) {
          const range = getRangeFromNode(arrayChild);
          if (range && isInRange(cursorPosition, range)) {
            return {
              key: [name, String(index)],
              value: arrayChild,
            };
          }
        }
      }
    }
  }
  return null;
}

export function findSelectionPath(
  node: object,
  cursorPosition: number,
): { path: string[]; node: object | null } {
  const nodePath: string[] = ['ast'];
  const visited = new Set<unknown>();
  let iter: null | object = node;
  while (iter) {
    // infinite loop guard
    if (visited.has(iter)) {
      break;
    }
    visited.add(iter);

    const result = findInObject(iter, cursorPosition, visited);
    if (result) {
      iter = result.value;
      nodePath.push(...result.key);
    } else {
      return { path: nodePath, node: iter };
    }
  }
  return { path: nodePath, node: null };
}
