import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { TSTypeAnnotation } from '../../special/TSTypeAnnotation/spec';
import type { TSTypeParameterDeclaration } from '../../special/TSTypeParameterDeclaration/spec';
import type { BlockStatement } from '../../statement/BlockStatement/spec';
import type { Expression } from '../../unions/Expression';
import type { Parameter } from '../../unions/Parameter';

export interface ArrowFunctionExpression extends BaseNode {
  type: AST_NODE_TYPES.ArrowFunctionExpression;
  generator: boolean;
  id: null;
  params: Parameter[];
  body: BlockStatement | Expression;
  async: boolean;
  expression: boolean;
  returnType?: TSTypeAnnotation;
  typeParameters?: TSTypeParameterDeclaration;
}
