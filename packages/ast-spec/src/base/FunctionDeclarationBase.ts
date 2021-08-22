import type { Identifier } from '../expression/Identifier/spec';
import type { TSTypeAnnotation } from '../special/TSTypeAnnotation/spec';
import type { TSTypeParameterDeclaration } from '../special/TSTypeParameterDeclaration/spec';
import type { BlockStatement } from '../statement/BlockStatement/spec';
import type { Parameter } from '../unions/Parameter';
import type { BaseNode } from './BaseNode';

export interface FunctionDeclarationBase extends BaseNode {
  id: Identifier | null;
  generator: boolean;
  expression: boolean;
  async: boolean;
  params: Parameter[];
  body?: BlockStatement | null;
  returnType?: TSTypeAnnotation;
  typeParameters?: TSTypeParameterDeclaration;
  declare?: boolean;
}
