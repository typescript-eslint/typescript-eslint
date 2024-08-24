import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { SpreadElement } from '../../element/SpreadElement/spec';
import type { Expression } from '../../unions/Expression';

export interface ArrayExpression extends BaseNode {
  /**
   * an element will be `null` in the case of a sparse array: `[1, ,3]`
   */
  elements: (Expression | SpreadElement | null)[];
  type: AST_NODE_TYPES.ArrayExpression;
}
