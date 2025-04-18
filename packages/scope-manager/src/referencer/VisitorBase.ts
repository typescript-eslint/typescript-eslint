import type { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/types';
import type { VisitorKeys } from '@typescript-eslint/visitor-keys';

import { visitorKeys } from '@typescript-eslint/visitor-keys';

export interface VisitorOptions {
  childVisitorKeys?: VisitorKeys | null;
  visitChildrenEvenIfSelectorExists?: boolean;
}

function isObject(obj: unknown): obj is Record<string, unknown> {
  return typeof obj === 'object' && obj != null;
}
function isNode(node: unknown): node is TSESTree.Node {
  return isObject(node) && typeof node.type === 'string';
}

type NodeVisitor = Partial<
  Record<AST_NODE_TYPES, (node: TSESTree.Node) => void>
>;

export abstract class VisitorBase {
  readonly #childVisitorKeys: VisitorKeys;
  readonly #visitChildrenEvenIfSelectorExists: boolean;
  constructor(options: VisitorOptions) {
    this.#childVisitorKeys = options.childVisitorKeys ?? visitorKeys;
    this.#visitChildrenEvenIfSelectorExists =
      options.visitChildrenEvenIfSelectorExists ?? false;
  }

  /**
   * Default method for visiting children.
   * @param node the node whose children should be visited
   * @param excludeArr a list of keys to not visit
   */
  visitChildren<T extends TSESTree.Node>(
    node: T | null | undefined,
    excludeArr: (keyof T)[] = [],
  ): void {
    if (node?.type == null) {
      return;
    }

    const exclude = new Set([...excludeArr, 'parent'] as string[]);
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
    if (node?.type == null) {
      return;
    }

    const visitor = (this as NodeVisitor)[node.type];
    if (visitor) {
      visitor.call(this, node);
      if (!this.#visitChildrenEvenIfSelectorExists) {
        return;
      }
    }

    this.visitChildren(node);
  }
}

export type { VisitorKeys } from '@typescript-eslint/visitor-keys';
