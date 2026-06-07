import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { TSTypeAnnotation } from '../../special/TSTypeAnnotation/spec';
import type { TSTypeParameterDeclaration } from '../../special/TSTypeParameterDeclaration/spec';
import type { BlockStatement } from '../../statement/BlockStatement/spec';
import type { Expression } from '../../unions/Expression';
import type { Parameter } from '../../unions/Parameter';

interface ArrowFunctionExpressionBase extends BaseNode {
  type: AST_NODE_TYPES.ArrowFunctionExpression;
  async: boolean;
  body: BlockStatement | Expression;
  expression: boolean;
  generator: false;
  id: null;
  params: Parameter[];
  returnType: TSTypeAnnotation | undefined;
  typeParameters: TSTypeParameterDeclaration | undefined;
}

export interface ArrowFunctionExpressionWithExpressionBody extends ArrowFunctionExpressionBase {
  body: Expression;
  expression: true;
}

export interface ArrowFunctionExpressionWithBlockBody extends ArrowFunctionExpressionBase {
  body: BlockStatement;
  expression: false;
}

export type ArrowFunctionExpression =
  | ArrowFunctionExpressionWithBlockBody
  | ArrowFunctionExpressionWithExpressionBody;
