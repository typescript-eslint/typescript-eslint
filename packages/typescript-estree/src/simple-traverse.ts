import type { VisitorKeys } from '@typescript-eslint/visitor-keys';

import { visitorKeys } from '@typescript-eslint/visitor-keys';

import type { TSESTree } from './ts-estree';

function isValidNode(x: unknown): x is TSESTree.Node {
  return (
    typeof x === 'object' &&
    x != null &&
    'type' in x &&
    typeof x.type === 'string'
  );
}

function getVisitorKeysForNode(
  allVisitorKeys: typeof visitorKeys,
  node: TSESTree.Node,
): readonly (keyof TSESTree.Node)[] {
  const keys = allVisitorKeys[node.type];
  return (keys ?? []) as never;
}

type SimpleTraverseOptions = Readonly<
  | {
      enter: (node: TSESTree.Node, parent: TSESTree.Node | undefined) => void;
      visitorKeys?: Readonly<VisitorKeys>;
    }
  | {
      visitorKeys?: Readonly<VisitorKeys>;
      visitors: Record<
        string,
        (node: TSESTree.Node, parent: TSESTree.Node | undefined) => void
      >;
    }
>;

class SimpleTraverser {
  private readonly allVisitorKeys: Readonly<VisitorKeys> = visitorKeys;
  private readonly selectors: SimpleTraverseOptions;
  private readonly setParentPointers: boolean;

  constructor(selectors: SimpleTraverseOptions, setParentPointers = false) {
    this.selectors = selectors;
    this.setParentPointers = setParentPointers;
    if (selectors.visitorKeys) {
      this.allVisitorKeys = selectors.visitorKeys;
    }
  }

  traverse(node: unknown, parent: TSESTree.Node | undefined): void {
    const nodeStack: unknown[] = [node];
    const parentStack: (TSESTree.Node | undefined)[] = [parent];

    while (nodeStack.length > 0) {
      const currentNode = nodeStack.pop();
      const currentParent = parentStack.pop();

      if (!isValidNode(currentNode)) {
        continue;
      }

      if (this.setParentPointers) {
        currentNode.parent = currentParent;
      }

      if ('enter' in this.selectors) {
        this.selectors.enter(currentNode, currentParent);
      } else if (currentNode.type in this.selectors.visitors) {
        this.selectors.visitors[currentNode.type](currentNode, currentParent);
      }

      const keys = getVisitorKeysForNode(this.allVisitorKeys, currentNode);
      if (keys.length < 1) {
        continue;
      }

      for (let keyIndex = keys.length - 1; keyIndex >= 0; keyIndex -= 1) {
        const childOrChildren = currentNode[keys[keyIndex]];

        if (Array.isArray(childOrChildren)) {
          for (
            let childIndex = childOrChildren.length - 1;
            childIndex >= 0;
            childIndex -= 1
          ) {
            nodeStack.push(childOrChildren[childIndex]);
            parentStack.push(currentNode);
          }
        } else {
          nodeStack.push(childOrChildren);
          parentStack.push(currentNode);
        }
      }
    }
  }
}

export function simpleTraverse(
  startingNode: TSESTree.Node,
  options: SimpleTraverseOptions,
  setParentPointers = false,
): void {
  new SimpleTraverser(options, setParentPointers).traverse(
    startingNode,
    undefined,
  );
}
