import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Identifier } from '../../expression/Identifier/spec';
import type { TSModuleBlock } from '../../special/TSModuleBlock/spec';
import type { TSQualifiedName } from '../../type/spec';
import type { Literal } from '../../unions/Literal';

export interface TSModuleDeclaration extends BaseNode {
  type: AST_NODE_TYPES.TSModuleDeclaration;
  /**
   * The name of the module
   * ```
   * namespace A {}
   * namespace A.B.C {}
   * module 'a' {}
   * ```
   */
  id: Identifier | Literal | TSQualifiedName;
  /**
   * The body of the module.
   * This can only be `undefined` for the code `declare module 'mod';`
   * This will be a `TSModuleDeclaration` if the name is "nested" (`Foo.Bar`).
   */
  body?: TSModuleBlock;
  /**
   * Whether this is a global declaration
   * ```
   * declare global {}
   * ```
   */
  // TODO(#5020) - make this `false` if not `global`
  global?: boolean;
  /**
   * Whether the module is `declare`d
   * ```
   * declare namespace F {}
   * ```
   */
  // TODO(#5020) - make this `false` if it is not `declare`d
  declare?: boolean;
}
