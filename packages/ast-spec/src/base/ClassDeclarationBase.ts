import type { Identifier } from '../expression/Identifier/spec';
import type { ClassBody } from '../special/ClassBody/spec';
import type { Decorator } from '../special/Decorator/spec';
import type { TSClassImplements } from '../special/TSClassImplements/spec';
import type { TSTypeParameterDeclaration } from '../special/TSTypeParameterDeclaration/spec';
import type { TSTypeParameterInstantiation } from '../special/TSTypeParameterInstantiation/spec';
import type { LeftHandSideExpression } from '../unions/LeftHandSideExpression';
import type { BaseNode } from './BaseNode';

export interface ClassDeclarationBase extends BaseNode {
  typeParameters?: TSTypeParameterDeclaration;
  superTypeParameters?: TSTypeParameterInstantiation;
  id: Identifier | null;
  body: ClassBody;
  superClass: LeftHandSideExpression | null;
  implements?: TSClassImplements[];
  abstract?: boolean;
  declare?: boolean;
  decorators?: Decorator[];
}
