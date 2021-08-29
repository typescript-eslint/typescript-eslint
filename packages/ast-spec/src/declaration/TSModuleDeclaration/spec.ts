import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Identifier } from '../../expression/Identifier/spec';
import type { TSModuleBlock } from '../../special/TSModuleBlock/spec';
import type { Literal } from '../../unions/Literal';
import type { Modifier } from '../../unions/Modifier';

export interface TSModuleDeclaration extends BaseNode {
  type: AST_NODE_TYPES.TSModuleDeclaration;
  id: Identifier | Literal;
  body?:
    | TSModuleBlock
    /*
    TODO - we currently emit this due to bad parser handling of nested modules
    namespace Foo.Bar {}
    ^^^^^^^^^^^^^^^^^^^^ TSModuleDeclaration
                  ^^^^^^ TSModuleDeclaration
                      ^^ TSModuleBlock

    This should instead emit a TSQualifiedName for the `id` and not emit an inner TSModuleDeclaration
    */
    | TSModuleDeclaration;
  global?: boolean;
  declare?: boolean;
  modifiers?: Modifier[];
}
