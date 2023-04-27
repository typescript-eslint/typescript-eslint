import type { ParentNodeType } from './types';
import { filterProperties, isESNode, isRecord, isTSNode } from './utils';

function isInRange(offset: number, value: object): boolean {
  const range = getRangeFromNode(value);
  return !!range && offset > range[0] && offset <= range[1];
}

function geNodeType(value: unknown): ParentNodeType {
  if (isRecord(value)) {
    return isESNode(value) ? 'esNode' : isTSNode(value) ? 'tsNode' : undefined;
  }
  return undefined;
}

function isIterable(key: string, value: unknown): boolean {
  return filterProperties(key, value, geNodeType(value));
}

function getRangeFromNode(value: object): null | [number, number] {
  if (isESNode(value)) {
    return value.range;
  } else if (isTSNode(value)) {
    return [value.pos, value.end];
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
    if (visited.has(child) || name === 'parent' || !isIterable(name, child)) {
      continue;
    }
    visited.add(iter);

    if (isRecord(child)) {
      if (isInRange(cursorPosition, child)) {
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
          if (isInRange(cursorPosition, arrayChild)) {
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
  const nodePath = ['ast'];
  const visited = new Set<unknown>();
  let currentNode: null | object = node;
  while (currentNode) {
    // infinite loop guard
    if (visited.has(currentNode)) {
      break;
    }
    visited.add(currentNode);

    const result = findInObject(currentNode, cursorPosition, visited);
    if (result) {
      currentNode = result.value;
      nodePath.push(...result.key);
    } else {
      return { path: nodePath, node: currentNode };
    }
  }
  return { path: nodePath, node: null };
}
