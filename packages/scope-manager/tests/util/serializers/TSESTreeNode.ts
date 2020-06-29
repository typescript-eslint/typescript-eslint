import { AST_NODE_TYPES } from '@typescript-eslint/types';
import { NewPlugin } from 'pretty-format';
import { createIdGenerator } from '../../../src/ID';

const EXCLUDED_KEYS = new Set([
  // prevent cycles
  'parent',
  // type is printed in front of the object
  'type',
  // locations are just noise
  'range',
  'loc',
]);

const generator = createIdGenerator();
type Node = Record<string, unknown> & { type: AST_NODE_TYPES };
const SEEN_NODES = new Map<Node, number>();

const serializer: NewPlugin = {
  test(val): boolean {
    return (
      val &&
      typeof val === 'object' &&
      // make sure it's not one of the classes from the package
      Object.getPrototypeOf(val) === Object.prototype &&
      'type' in val &&
      val.type in AST_NODE_TYPES
    );
  },
  serialize(node: Node): string {
    if (node.type === AST_NODE_TYPES.Identifier) {
      return `Identifier<"${node.name}">`;
    }

    const keys = Object.keys(node).filter(k => !EXCLUDED_KEYS.has(k));
    if (keys.length === 0) {
      return `${node.type}`;
    }

    if (SEEN_NODES.has(node)) {
      return `${node.type}$${SEEN_NODES.get(node)}`;
    }

    const id = generator();
    SEEN_NODES.set(node, id);
    return `${node.type}$${id}`;
  },
};

export { serializer };
