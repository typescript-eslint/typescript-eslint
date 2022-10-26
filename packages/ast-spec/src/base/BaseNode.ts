// import type { Node } from '../unions/Node';
import type { AST_NODE_TYPES } from '../ast-node-types';
import type { NodeOrTokenData } from './NodeOrTokenData';

export interface BaseNode extends NodeOrTokenData {
  /**
   * The parent node of the current node
   *
   * This is added in the @typescript-eslint/types package as ESLint adds it
   * while traversing.
   */
  // parent?: Node;

  type: AST_NODE_TYPES;
}
