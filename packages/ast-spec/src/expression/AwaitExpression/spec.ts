import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { LeftHandSideExpression } from '../../unions/LeftHandSideExpression';
import type { TSTypeAssertion } from '../TSTypeAssertion/spec';
import type { UnaryExpression } from '../UnaryExpression/spec';
import type { UpdateExpression } from '../UpdateExpression/spec';

export interface AwaitExpression extends BaseNode {
  type: AST_NODE_TYPES.AwaitExpression;
  argument:
    | AwaitExpression
    | LeftHandSideExpression
    | TSTypeAssertion
    | UnaryExpression
    | UpdateExpression;
}
