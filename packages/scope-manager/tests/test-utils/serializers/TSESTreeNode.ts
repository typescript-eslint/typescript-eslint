import type { TSESTree } from '@typescript-eslint/types';
import type { NewPlugin } from 'pretty-format';

import { AST_NODE_TYPES } from '@typescript-eslint/types';

import { createIdGenerator } from '../../../src/ID';

const EXCLUDED_KEYS = new Set([
  // prevent cycles
  'parent',
  // type is printed in front of the object
  'type',
  // locations are just noise
  'loc',
  'range',
]);

const generator = createIdGenerator();
type Node = { type: AST_NODE_TYPES } & Record<string, unknown>;
type Identifier = { name: string; type: AST_NODE_TYPES.Identifier } & Record<
  string,
  unknown
>;
const SEEN_NODES = new Map<Node, number>();

export const serializer: NewPlugin = {
  serialize(node: Node): string {
    if (node.type === AST_NODE_TYPES.Identifier) {
      return `Identifier<"${(node as Identifier).name}">`;
    }

    const keys = Object.keys(node).filter(k => !EXCLUDED_KEYS.has(k));
    if (keys.length === 0) {
      return node.type;
    }

    if (SEEN_NODES.has(node)) {
      return `${node.type}$${SEEN_NODES.get(node)}`;
    }

    const id = generator();
    SEEN_NODES.set(node, id);
    return `${node.type}$${id}`;
  },
  test(val): boolean {
    return !!(
      val &&
      typeof val === 'object' &&
      // make sure it's not one of the classes from the package
      Object.getPrototypeOf(val) === Object.prototype &&
      'type' in val &&
      (val as TSESTree.Node).type in AST_NODE_TYPES
    );
  },
};
