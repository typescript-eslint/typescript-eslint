import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type {
  LetOrConstOrVarDeclarator,
  DeclareLetOrVarDeclarator,
  LetOrVarDeclaratorDefiniteAssignment,
  LetOrConstOrVarDeclaratorNoDefiniteAssignment,
  ConstDeclaratorWithInit,
  UsingInForOfDeclarator,
  UsingInNomalConextDeclarator,
} from '../../special/VariableDeclarator/spec';

export interface LetOrConstOrVarDeclarationBase extends BaseNode {
  type: AST_NODE_TYPES.VariableDeclaration;
  /**
   * The variables declared by this declaration.
   * Always non-empty.
   * ```
   * let x;
   * let y, z;
   * ```
   */
  // TODO(#1852) - this should be guaranteed to have at least 1 element in it.
  declarations: LetOrConstOrVarDeclarator[];
  /**
   * Whether the declaration is `declare`d
   * ```
   * declare const x = 1;
   * ```
   */
  declare: boolean;
  /**
   * The keyword used to declare the variable(s)
   * ```
   * const x = 1;
   * let y = 2;
   * var z = 3;
   * ```
   */
  kind: 'const' | 'let' | 'var';
}

export interface LetOrVarDeclaredDeclaration
  extends LetOrConstOrVarDeclarationBase {
  kind: 'let' | 'var';
  declare: true;
  /**
   * In a `declare let` declaration, the declarators must not have definite assignment
   * assertions or initializers.
   * ```
   * declare let x: number;
   * declare let y, z;
   * ```
   */
  declarations: DeclareLetOrVarDeclarator[];
}

export interface LetOrVarNonDeclaredDeclaration
  extends LetOrConstOrVarDeclarationBase {
  kind: 'let' | 'var';
  declare: false;
  /**
   * In a `let`/`var` declaration, the declarators may have definite assignment
   * assertions or initializers, but not both.
   */
  declarations: (
    | LetOrVarDeclaratorDefiniteAssignment
    | LetOrConstOrVarDeclaratorNoDefiniteAssignment
  )[];
}

export interface ConstDeclaredDeclaration
  extends LetOrConstOrVarDeclarationBase {
  kind: 'const';
  declare: true;
  /**
   * In a `declare const` declaration, the declarators may have initializers, but
   * not definite assignment assertions. Each declarator cannot have both an
   * initializer and a type annotation.
   */
  declarations: LetOrConstOrVarDeclaratorNoDefiniteAssignment[];
}

export interface ConstNonDeclaredDeclaration
  extends LetOrConstOrVarDeclarationBase {
  kind: 'const';
  declare: false;
  /**
   * In a `const` declaration, the declarators must have initializers.
   */
  declarations: ConstDeclaratorWithInit[];
}

export type LetOrConstOrVarDeclaration =
  | LetOrVarDeclaredDeclaration
  | LetOrVarNonDeclaredDeclaration
  | ConstDeclaredDeclaration
  | ConstNonDeclaredDeclaration;

interface UsingDeclarationBase extends BaseNode {
  type: AST_NODE_TYPES.VariableDeclaration;
  /**
   * This value will always be `false`
   * because 'declare' modifier cannot appear on a 'using' declaration.
   */
  declare: false;
  /**
   * The keyword used to declare the variable(s)
   * ```
   * using x = 1;
   * await using y = 2;
   * ```
   */
  kind: 'await using' | 'using';
}

export interface UsingInNormalContextDeclaration extends UsingDeclarationBase {
  /**
   * The variables declared by this declaration.
   * Always non-empty.
   * ```
   * using x = 1;
   * using y = 1, z = 2;
   * ```
   */
  // TODO(#1852) - this should be guaranteed to have at least 1 element in it.
  declarations: UsingInNomalConextDeclarator[];
}

export interface UsingInForOfDeclaration extends UsingDeclarationBase {
  /**
   * The variables declared by this declaration.
   * Always has exactly one element.
   * ```
   * for (using x of y) {}
   * ```
   */
  declarations: [UsingInForOfDeclarator];
}

export type UsingDeclaration =
  | UsingInForOfDeclaration
  | UsingInNormalContextDeclaration;

export type VariableDeclaration = LetOrConstOrVarDeclaration | UsingDeclaration;
