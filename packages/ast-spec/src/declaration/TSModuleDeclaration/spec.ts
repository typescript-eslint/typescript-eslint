import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Identifier } from '../../expression/Identifier/spec';
import type { TSModuleBlock } from '../../special/TSModuleBlock/spec';
import type { Literal } from '../../unions/Literal';
import type { Modifier } from '../../unions/Modifier';

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
  id: Identifier | Literal;
  /**
   * The body of the module.
   * This can only be `undefined` for the code `declare module 'mod';`
   * This will be a `TSModuleDeclaration` if the name is "nested" (`Foo.Bar`).
   */
  body?:
    | TSModuleBlock
    /*
    TODO(#4966) - we currently emit this due to bad parser handling of nested modules
    namespace Foo.Bar {}
    ^^^^^^^^^^^^^^^^^^^^ TSModuleDeclaration
                  ^^^^^^ TSModuleDeclaration
                      ^^ TSModuleBlock

    This should instead emit a TSQualifiedName for the `id` and not emit an inner TSModuleDeclaration
    */
    | TSModuleDeclaration;
  /**
   * Whether this is a global declaration
   * ```
   * declare global {}
   * ```
   */
  global?: true;
  /**
   * Whether the module is `declare`d
   * ```
   * declare namespace F {}
   * ```
   */
  declare?: true;
  // TODO(#4759) - breaking change remove this
  modifiers?: Modifier[];
}
