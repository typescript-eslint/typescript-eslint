import type { Identifier } from '../expression/Identifier/spec';
import type { ClassBody } from '../special/ClassBody/spec';
import type { Decorator } from '../special/Decorator/spec';
import type { TSClassImplements } from '../special/TSClassImplements/spec';
import type { TSTypeParameterDeclaration } from '../special/TSTypeParameterDeclaration/spec';
import type { TSTypeParameterInstantiation } from '../special/TSTypeParameterInstantiation/spec';
import type { LeftHandSideExpression } from '../unions/LeftHandSideExpression';
import type { BaseNode } from './BaseNode';

export interface ClassBase extends BaseNode {
  /**
   * Whether the class is an abstract class.
   * ```
   * abstract class Foo {...}
   * ```
   */
  abstract: boolean;
  /**
   * The class body.
   */
  body: ClassBody;
  /**
   * Whether the class has been `declare`d:
   * ```
   * declare class Foo {...}
   * ```
   */
  declare: boolean;
  /**
   * The decorators declared for the class.
   * ```
   * @deco
   * class Foo {...}
   * ```
   */
  decorators: Decorator[];
  /**
   * The class's name.
   * - For a `ClassExpression` this may be `null` if the name is omitted.
   * - For a `ClassDeclaration` this may be `null` if and only if the parent is
   *   an `ExportDefaultDeclaration`.
   */
  id: Identifier | null;
  /**
   * The implemented interfaces for the class.
   */
  implements: TSClassImplements[];
  /**
   * The super class this class extends.
   */
  superClass: LeftHandSideExpression | null;
  /**
   * The generic type parameters passed to the superClass.
   */
  superTypeParameters: TSTypeParameterInstantiation | undefined;
  /**
   * The generic type parameters declared for the class.
   */
  typeParameters: TSTypeParameterDeclaration | undefined;
}
