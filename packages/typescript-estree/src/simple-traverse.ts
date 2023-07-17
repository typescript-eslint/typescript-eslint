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
      visitorKeys?: Readonly<VisitorKeys>;
      enter: (node: TSESTree.Node, parent: TSESTree.Node | undefined) => void;
    }
  | {
      visitorKeys?: Readonly<VisitorKeys>;
      visitors: {
        [key: string]: (
          node: TSESTree.Node,
          parent: TSESTree.Node | undefined,
        ) => void;
      };
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
    if (!isValidNode(node)) {
      return;
    }

    if (this.setParentPointers) {
      node.parent = parent;
    }

    if ('enter' in this.selectors) {
      this.selectors.enter(node, parent);
    } else if (node.type in this.selectors.visitors) {
      this.selectors.visitors[node.type](node, parent);
    }

    const keys = getVisitorKeysForNode(this.allVisitorKeys, node);
    if (keys.length < 1) {
      return;
    }

    for (const key of keys) {
      const childOrChildren = node[key];

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
  setParentPointers = false,
): void {
  new SimpleTraverser(options, setParentPointers).traverse(
    startingNode,
    undefined,
  );
}
