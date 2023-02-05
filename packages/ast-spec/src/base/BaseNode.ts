// import type { Node } from '../unions/Node';
import type { AST_NODE_TYPES } from '../ast-node-types';
import type { NodeOrTokenData } from './NodeOrTokenData';

export interface BaseNode extends NodeOrTokenData {
  type: AST_NODE_TYPES;

  /**
   * The parent node of the current node
   *
   * This is added in the @typescript-eslint/types package as ESLint adds it
   * while traversing.
   */
  // parent?: Node;
}
