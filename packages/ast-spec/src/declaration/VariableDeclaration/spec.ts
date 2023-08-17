import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type {
  LetOrConstOrVarDeclarator,
  UsingDeclarator,
} from '../../special/VariableDeclarator/spec';

export interface LetOrConstOrVarDeclaration extends BaseNode {
  type: AST_NODE_TYPES.VariableDeclaration;
  /**
   * The variables declared by this declaration.
   * Note that there may be 0 declarations (i.e. `const;`).
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

export interface UsingDeclaration extends BaseNode {
  type: AST_NODE_TYPES.VariableDeclaration;
  /**
   * The variables declared by this declaration.
   * Note that there may be 0 declarations (i.e. `const;`).
   * ```
   * using x = 1;
   * using y =1, z = 2;
   * ```
   */
  // TODO(#1852) - this should be guaranteed to have at least 1 element in it.
  declarations: UsingDeclarator[];
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

export type VariableDeclaration = LetOrConstOrVarDeclaration | UsingDeclaration;
