import type { AST_NODE_TYPES } from '../src/ast-node-types';
import type { Node } from '../src/unions/Node';

type GetKeys<T extends AST_NODE_TYPES> = keyof Extract<Node, { type: T }>;

type AllKeys = {
  readonly [T in AST_NODE_TYPES]: GetKeys<T>;
};

type TakesString<T extends Record<string, string>> = T;

// @ts-expect-error: purposely unused
type _Test =
  // forcing the test onto a new line so it isn't covered by the expect error
  // If there are any enum members that don't have a corresponding TSESTree.Node, then this line will error with "Type 'string | number | symbol' is not assignable to type 'string'."
  TakesString<AllKeys> | void;
