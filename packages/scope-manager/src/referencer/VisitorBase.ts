import { TSESTree, AST_NODE_TYPES } from '@typescript-eslint/types';
import { visitorKeys, VisitorKeys } from '@typescript-eslint/visitor-keys';

interface VisitorOptions {
  childVisitorKeys?: VisitorKeys | null;
}

function isObject(obj: unknown): obj is Record<string, unknown> {
  return typeof obj === 'object' && obj != null;
}
function isNode(node: unknown): node is TSESTree.Node {
  return isObject(node) && typeof node.type === 'string';
}

type NodeVisitor = {
  [K in AST_NODE_TYPES]?: (node: TSESTree.Node) => void;
};

abstract class VisitorBase {
  readonly #childVisitorKeys: VisitorKeys;
  constructor(options: VisitorOptions) {
    this.#childVisitorKeys = options.childVisitorKeys ?? visitorKeys;
  }

  /**
   * Default method for visiting children.
   * @param node the node whose children should be visited
   * @param exclude a list of keys to not visit
   */
  visitChildren<T extends TSESTree.Node>(
    node: T | null | undefined,
    excludeArr?: (keyof T)[],
  ): void {
    if (node == null || node.type == null) {
      return;
    }

    const exclude = new Set(excludeArr) as Set<string>;
    const children = this.#childVisitorKeys[node.type] ?? Object.keys(node);
    for (const key of children) {
      if (exclude.has(key)) {
        continue;
      }

      const child = node[key as keyof TSESTree.Node] as unknown;
      if (!child) {
        continue;
      }

      if (Array.isArray(child)) {
        for (const subChild of child) {
          if (isNode(subChild)) {
            this.visit(subChild);
          }
        }
      } else if (isNode(child)) {
        this.visit(child);
      }
    }
  }

  /**
   * Dispatching node.
   */
  visit(node: TSESTree.Node | null | undefined): void {
    if (node == null || node.type == null) {
      return;
    }

    const visitor = (this as NodeVisitor)[node.type];
    if (visitor) {
      return visitor.call(this, node);
    }

    this.visitChildren(node);
  }
}

export { VisitorBase, VisitorOptions, VisitorKeys };
