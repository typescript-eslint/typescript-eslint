import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { VariableDeclarator } from '../../special/VariableDeclarator/spec';

export interface VariableDeclaration extends BaseNode {
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
  declarations: VariableDeclarator[];
  /**
   * Whether the declaration is `declare`d
   * ```
   * declare const x = 1;
   * ```
   */
  declare?: true;
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
