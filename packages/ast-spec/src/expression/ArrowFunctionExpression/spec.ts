import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { TSTypeAnnotation } from '../../special/TSTypeAnnotation/spec';
import type { TSTypeParameterDeclaration } from '../../special/TSTypeParameterDeclaration/spec';
import type { BlockStatement } from '../../statement/BlockStatement/spec';
import type { Expression } from '../../unions/Expression';
import type { Parameter } from '../../unions/Parameter';

export interface ArrowFunctionExpression extends BaseNode {
  type: AST_NODE_TYPES.ArrowFunctionExpression;
  typeParameters: TSTypeParameterDeclaration | undefined;
  async: boolean;
  body: BlockStatement | Expression;
  expression: boolean;
  generator: boolean;
  id: null;
  params: Parameter[];
  returnType: TSTypeAnnotation | undefined;
}
