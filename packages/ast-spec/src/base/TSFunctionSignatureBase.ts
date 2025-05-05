import type { TSTypeAnnotation } from '../special/TSTypeAnnotation/spec';
import type { TSTypeParameterDeclaration } from '../special/TSTypeParameterDeclaration/spec';
import type { Parameter } from '../unions/Parameter';
import type { BaseNode } from './BaseNode';

export interface TSFunctionSignatureBase extends BaseNode {
  typeParameters: TSTypeParameterDeclaration | undefined;
  params: Parameter[];
  returnType: TSTypeAnnotation | undefined;
}
