import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type {
  LetOrConstOrVarDeclarator,
  UsingInForOfDeclarator,
  UsingInNormalContextDeclarator,
  VariableDeclaratorDefiniteAssignment,
  VariableDeclaratorMaybeInit,
  VariableDeclaratorNoInit,
} from '../../special/VariableDeclarator/spec';

interface LetOrConstOrVarDeclarationBase extends BaseNode {
  type: AST_NODE_TYPES.VariableDeclaration;
  /**
   * The variables declared by this declaration.
   * Always non-empty.
   * ```
   * let x;
   * let y, z;
   * ```
   */
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
  declarations: VariableDeclaratorNoInit[];
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
    | VariableDeclaratorDefiniteAssignment
    | VariableDeclaratorMaybeInit
  )[];
}

export interface ConstDeclaration extends LetOrConstOrVarDeclarationBase {
  kind: 'const';
  /**
   * In a `declare const` declaration, the declarators may have initializers, but
   * not definite assignment assertions. Each declarator cannot have both an
   * initializer and a type annotation.
   *
   * Even if the declaration has no `declare`, it may still be ambient and have
   * no initializer.
   */
  declarations: VariableDeclaratorMaybeInit[];
}

export type LetOrConstOrVarDeclaration =
  | ConstDeclaration
  | LetOrVarDeclaredDeclaration
  | LetOrVarNonDeclaredDeclaration;

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
  declarations: UsingInNormalContextDeclarator[];
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
