import { visitorKeys } from '@typescript-eslint/visitor-keys';
import { TSESTree } from './ts-estree';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isValidNode(x: any): x is TSESTree.Node {
  return x !== null && typeof x === 'object' && typeof x.type === 'string';
}

function getVisitorKeysForNode(
  allVisitorKeys: typeof visitorKeys,
  node: TSESTree.Node,
): readonly (keyof TSESTree.Node)[] {
  const keys = allVisitorKeys[node.type];
  return (keys ?? []) as never;
}

type SimpleTraverseOptions =
  | {
      enter: (node: TSESTree.Node, parent: TSESTree.Node | undefined) => void;
    }
  | {
      [key: string]: (
        node: TSESTree.Node,
        parent: TSESTree.Node | undefined,
      ) => void;
    };

class SimpleTraverser {
  private readonly allVisitorKeys = visitorKeys;
  private readonly selectors: SimpleTraverseOptions;
  private readonly setParentPointers: boolean;

  constructor(selectors: SimpleTraverseOptions, setParentPointers = false) {
    this.selectors = selectors;
    this.setParentPointers = setParentPointers;
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
    } else if (node.type in this.selectors) {
      this.selectors[node.type](node, parent);
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
