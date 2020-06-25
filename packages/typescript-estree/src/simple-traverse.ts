import { visitorKeys } from '@typescript-eslint/visitor-keys';
import { TSESTree } from './ts-estree';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isValidNode(x: any): x is TSESTree.Node {
  return x !== null && typeof x === 'object' && typeof x.type === 'string';
}

function getVisitorKeysForNode(
  allVisitorKeys: typeof visitorKeys,
  node: TSESTree.Node,
): readonly string[] {
  const keys = allVisitorKeys[node.type];
  return keys ?? [];
}

interface SimpleTraverseOptions {
  enter: (node: TSESTree.Node, parent: TSESTree.Node | undefined) => void;
}

class SimpleTraverser {
  private allVisitorKeys = visitorKeys;
  private enter: SimpleTraverseOptions['enter'];

  constructor({ enter }: SimpleTraverseOptions) {
    this.enter = enter;
  }

  traverse(node: unknown, parent: TSESTree.Node | undefined): void {
    if (!isValidNode(node)) {
      return;
    }
    this.enter(node, parent);

    const keys = getVisitorKeysForNode(this.allVisitorKeys, node);
    if (keys.length < 1) {
      return;
    }

    for (const key of keys) {
      const childOrChildren = node[key as keyof TSESTree.Node];

      if (Array.isArray(childOrChildren)) {
        for (const child of childOrChildren) {
          this.traverse(child, node);
        }
      } else {
        this.traverse(childOrChildren, node);
      }
    }
  }
}

export function simpleTraverse(
  startingNode: TSESTree.Node,
  options: SimpleTraverseOptions,
): void {
  new SimpleTraverser(options).traverse(startingNode, undefined);
}
